"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Session } from "next-auth";

// This declaration extends the Session type from NextAuth to include our custom accessToken.
// This is necessary for TypeScript to know that the property exists.
declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

export default function App() {
  const { data: session, status } = useSession();
  const [dataFromBackend, setDataFromBackend] = useState<any>(null);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProtectedData = async () => {
      // Check if session exists and has a user and accessToken before fetching.
      if (session?.user && session?.accessToken) {
        setLoadingBackend(true);
        setError(null);
        try {
          // Replace this URL with the actual endpoint of your C# backend API.
          const response = await fetch("http://localhost:5000/products", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              // Attach the Azure AD access token to the request.
              "Authorization": `Bearer ${session.accessToken}`
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          setDataFromBackend(data);
        } catch (e: unknown) {
          // This block now correctly handles the 'unknown' type for the caught error.
          if (e instanceof Error) {
            setError(e.message);
          } else {
            setError("An unknown error occurred while fetching data.");
          }
        } finally {
          setLoadingBackend(false);
        }
      }
    };

    fetchProtectedData();
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white font-sans">
      <div className="w-full max-w-2xl p-8 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-4xl font-extrabold text-center mb-6 text-indigo-400">
          Azure AD & C# Backend
        </h1>
        
        {session?.user ? (
          <div className="space-y-6 text-center">
            <p className="text-lg">
              Welcome, <span className="font-semibold text-green-400">{session.user.name}</span>!
            </p>
            <p className="text-sm text-gray-400">
              You are authenticated with Azure AD.
            </p>
            
            <button
              onClick={() => signOut()}
              className="w-full px-6 py-3 font-semibold rounded-lg text-white transition-colors duration-200 bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Sign out
            </button>
            
            <div className="mt-8 border-t border-gray-600 pt-6">
              <h2 className="text-2xl font-bold text-center mb-4 text-indigo-300">
                Data from C# Backend
              </h2>
              {loadingBackend ? (
                <p className="text-yellow-400">Loading data...</p>
              ) : error ? (
                <div className="p-4 bg-red-900 text-red-300 rounded-lg">
                  <p>Error fetching data: {error}</p>
                  <p className="mt-2 text-sm text-red-400">
                    Make sure your C# backend is running and that you have a valid token.
                  </p>
                </div>
              ) : (
                <pre className="p-4 overflow-x-auto bg-gray-700 text-green-300 rounded-lg text-left whitespace-pre-wrap">
                  {JSON.stringify(dataFromBackend, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-lg mb-4">You are not signed in.</p>
            <button
              onClick={() => signIn("azure-ad")}
              className="w-full px-6 py-3 font-semibold rounded-lg text-gray-900 transition-colors duration-200 bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Sign in with Azure AD
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
