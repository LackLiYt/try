using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add Azure AD Authentication from configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

// Add authorization services
builder.Services.AddAuthorization();

// Add CORS policy for local development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextjsOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000")
                    .AllowAnyHeader()
                    .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// We are intentionally removing the Swagger code to fix the build errors.
app.UseHttpsRedirection();
app.UseCors("AllowNextjsOrigin");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
