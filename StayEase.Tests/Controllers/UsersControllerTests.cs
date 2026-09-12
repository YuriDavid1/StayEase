using Microsoft.AspNetCore.Mvc;
using StayEase.Api.Controllers;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Controllers;

public class UsersControllerTests
{
    [Fact]
    public async Task GetUsers_DeveRetornarTodosOsUsuarios()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        db.Users.AddRange(
            new User
            {
                Email = "admin@stayease.com",
                Role = UserRole.Administrator
            },
            new User
            {
                Email = "recepcao@stayease.com",
                Role = UserRole.Receptionist
            }
        );

        await db.SaveChangesAsync();

        var controller = new UsersController(db);

        // Act
        var result = await controller.GetUsers();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var users = Assert.IsAssignableFrom<IEnumerable<User>>(okResult.Value);

        Assert.Equal(2, users.Count());
    }

    [Fact]
    public async Task GetUsers_QuandoNaoExistemUsuarios_DeveRetornarListaVazia()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new UsersController(db);

        // Act
        var result = await controller.GetUsers();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var users = Assert.IsAssignableFrom<IEnumerable<User>>(okResult.Value);

        Assert.Empty(users);
    }

    [Fact]
    public async Task AddUser_ComDadosValidos_DeveCriarUsuario()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new UsersController(db);

        var dto = new CreateUserDto(
            "admin@stayease.com",
            UserRole.Administrator
        );

        // Act
        var result = await controller.AddUser(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(okResult.Value);

        Assert.Equal("admin@stayease.com", user.Email);
        Assert.Equal(UserRole.Administrator, user.Role);

        Assert.Single(db.Users);
    }

    [Fact]
    public async Task AddUser_DeveGerarIdParaNovoUsuario()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new UsersController(db);

        var dto = new CreateUserDto(
            "usuario@stayease.com",
            UserRole.Receptionist
        );

        // Act
        var result = await controller.AddUser(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var user = Assert.IsType<User>(okResult.Value);

        Assert.True(user.UserId > 0);
    }

    [Fact]
    public async Task AddUser_DevePersistirEmailERole()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new UsersController(db);

        var dto = new CreateUserDto(
            "recepcao@stayease.com",
            UserRole.Receptionist
        );

        // Act
        await controller.AddUser(dto);

        // Assert
        var user = db.Users.Single();

        Assert.Equal("recepcao@stayease.com", user.Email);
        Assert.Equal(UserRole.Receptionist, user.Role);
    }

    [Fact]
    public async Task UpdateUser_QuandoUsuarioExiste_DeveAtualizarPerfil()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var user = new User
        {
            Email = "usuario@stayease.com",
            Role = UserRole.Receptionist
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var controller = new UsersController(db);

        var dto = new UpdateUserDto(
            UserRole.Administrator
        );

        // Act
        var result = await controller.UpdateUser(user.UserId, dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var updatedUser = Assert.IsType<User>(okResult.Value);

        Assert.Equal(UserRole.Administrator, updatedUser.Role);
    }

    [Fact]
    public async Task UpdateUser_NaoDeveAlterarEmail()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var user = new User
        {
            Email = "original@stayease.com",
            Role = UserRole.Receptionist
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var controller = new UsersController(db);

        var dto = new UpdateUserDto(
            UserRole.Administrator
        );

        // Act
        await controller.UpdateUser(user.UserId, dto);

        // Assert
        var updatedUser = await db.Users.FindAsync(user.UserId);

        Assert.NotNull(updatedUser);
        Assert.Equal("original@stayease.com", updatedUser.Email);
        Assert.Equal(UserRole.Administrator, updatedUser.Role);
    }

    [Fact]
    public async Task UpdateUser_QuandoUsuarioNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new UsersController(db);

        var dto = new UpdateUserDto(
            UserRole.Administrator
        );

        // Act
        var result = await controller.UpdateUser(999, dto);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_QuandoUsuarioExiste_DeveRemoverUsuario()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var user = new User
        {
            Email = "usuario@stayease.com",
            Role = UserRole.Receptionist
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        var controller = new UsersController(db);

        // Act
        var result = await controller.DeleteUser(user.UserId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        Assert.IsType<User>(okResult.Value);
        Assert.Empty(db.Users);
    }

    [Fact]
    public async Task DeleteUser_QuandoUsuarioNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new UsersController(db);

        // Act
        var result = await controller.DeleteUser(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public async Task DeleteUser_DeveRemoverSomenteOUsuarioInformado()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var user1 = new User
        {
            Email = "user1@stayease.com",
            Role = UserRole.Receptionist
        };

        var user2 = new User
        {
            Email = "user2@stayease.com",
            Role = UserRole.Housekeeping
        };

        db.Users.AddRange(user1, user2);
        await db.SaveChangesAsync();

        var controller = new UsersController(db);

        // Act
        await controller.DeleteUser(user1.UserId);

        // Assert
        Assert.Null(await db.Users.FindAsync(user1.UserId));
        Assert.NotNull(await db.Users.FindAsync(user2.UserId));
        Assert.Single(db.Users);
    }
}