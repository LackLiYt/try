import { useEffect, useState } from 'react';
import { PublicClientApplication, AccountInfo, AuthenticationResult, Configuration, RedirectRequest, PopupRequest } from '@azure/msal-browser';

// Define the shape of a product
interface Product {
    id: number;
    name: string;
    price: number;
}

// These placeholders must be replaced with your Azure AD details
// from the appsettings.json file in your C# backend project.
const AZURE_AD_TENANT_ID = 'YOUR_AZURE_AD_TENANT_ID';
const AZURE_AD_CLIENT_ID = 'YOUR_AZURE_AD_CLIENT_ID';
const BACKEND_API_URL = 'http://localhost:5262/products';

// MSAL configuration
const msalConfig: Configuration = {
    auth: {
        clientId: AZURE_AD_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${AZURE_AD_TENANT_ID}`,
        redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    }
};

const msalInstance = new PublicClientApplication(msalConfig);

const loginRequest: PopupRequest | RedirectRequest = {
    scopes: [`api://${AZURE_AD_CLIENT_ID}/.default`]
};

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [products, setProducts] = useState<Product[] | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('Please sign in to view products.');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            await msalInstance.initialize();
            try {
                const accounts: AccountInfo[] = msalInstance.getAllAccounts();
                if (accounts.length > 0) {
                    setIsAuthenticated(true);
                    setStatusMessage('Signed in. Fetching products...');
                    await getProducts(accounts[0]);
                } else {
                    setStatusMessage('Please sign in to view products.');
                }
            } catch (error) {
                console.error("Authentication check failed:", error);
                setStatusMessage('Authentication check failed.');
            }
        };
        checkAuthentication();
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const loginResponse: AuthenticationResult = await msalInstance.loginPopup(loginRequest);
            setIsAuthenticated(true);
            setStatusMessage('Signed in. Fetching products...');
            await getProducts(loginResponse.account);
        } catch (error: any) {
            console.error("Login failed:", error);
            setStatusMessage(`Login failed: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        msalInstance.logoutRedirect();
    };

    const getProducts = async (account: AccountInfo) => {
        try {
            const tokenResponse: AuthenticationResult = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: account
            });

            const response = await fetch(BACKEND_API_URL, {
                headers: {
                    'Authorization': `Bearer ${tokenResponse.accessToken}`,
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setStatusMessage('Unauthorized. Please sign in again.');
                    setIsAuthenticated(false);
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data: Product[] = await response.json();
            setProducts(data);
            setStatusMessage('Products loaded successfully.');
        } catch (error: any) {
            console.error("Failed to fetch products:", error);
            setStatusMessage(`Failed to load products: ${error.message}. Is your backend running?`);
            setIsAuthenticated(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="container mx-auto p-8 rounded-lg shadow-xl bg-white max-w-lg w-full">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Product Viewer</h1>
                
                <div className="mb-6 text-center">
                    <p className="text-gray-600 mb-4">{statusMessage}</p>
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className={`w-full font-bold py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                        >
                            {isLoading ? 'Signing In...' : 'Sign In'}
                        </button>
                    )}
                </div>
                
                {products && (
                    <div className="mt-6">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Available Products</h2>
                        <div className="space-y-4">
                            {products.map(product => (
                                <div key={product.id} className="p-4 rounded-lg shadow-md bg-gray-50">
                                    <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                                    <p className="text-lg text-gray-600 mt-2">${product.price.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}