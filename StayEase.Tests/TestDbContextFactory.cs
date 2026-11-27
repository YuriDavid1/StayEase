using Microsoft.EntityFrameworkCore;
using StayEase.Api.Data;

namespace StayEase.Tests;

public static class TestDbContextFactory
{
    public static AppDbContext Create()
    {
        return Create(Guid.NewGuid().ToString());
    }

    /// <summary>
    /// Contexts created with the same name share the same in-memory database. Use a second
    /// context to assert what was actually saved, not what is tracked by the first one.
    /// </summary>
    public static AppDbContext Create(string databaseName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        return new AppDbContext(options);
    }
}
