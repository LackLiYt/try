using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    // This attribute protects the endpoint, requiring a valid JWT.
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class ProductsController : ControllerBase
    {
        // This is a placeholder that returns a hardcoded list of products.
        // It does not connect to a database.
        [HttpGet]
        public IEnumerable<Product> Get()
        {
            return new List<Product>
            {
                new Product { Id = 1, Name = "Laptop", Price = 1200.50M },
                new Product { Id = 2, Name = "Mouse", Price = 25.75M },
                new Product { Id = 3, Name = "Keyboard", Price = 75.00M }
            };
        }
    }

    public class Product
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public decimal Price { get; set; }
    }
}
