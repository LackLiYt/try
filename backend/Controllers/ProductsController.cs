using Microsoft.AspNetCore.Mvc;
using Supabase;
using Postgrest;
using Microsoft.AspNetCore.Authorization; // 🟢 NEW

namespace YourProject.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize] // 🟢 NEW: This attribute protects all endpoints in this controller
public class ProductsController : ControllerBase
{
    private readonly Client _supabase;

    public ProductsController(Client supabase)
    {
        _supabase = supabase;
    }

    [HttpGet(Name = "GetProducts")]
    public async Task<IResult> Get()
    {
        var response = await _supabase.From<Product>().Get();

        if (response.Models != null && response.Models.Any())
        {
            return Results.Ok(response.Models);
        }

        return Results.NotFound("No products found.");
    }
}