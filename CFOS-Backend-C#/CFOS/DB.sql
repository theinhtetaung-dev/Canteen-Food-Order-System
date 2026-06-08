-- 1. Create and select the database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CFOSDB')
    CREATE DATABASE CFOSDB;
GO
USE CFOSDB;
GO

-- 2. Drop tables in reverse order of dependencies
-- Note: MSSQL does not have a simple SET FOREIGN_KEY_CHECKS. 
-- We must explicitly drop constraints or tables in order.
DROP TABLE IF EXISTS Tbl_Payment;
DROP TABLE IF EXISTS Tbl_OrderItem;
DROP TABLE IF EXISTS Tbl_Order;
DROP TABLE IF EXISTS Tbl_Food;
DROP TABLE IF EXISTS Tbl_FoodCategory;
DROP TABLE IF EXISTS Tbl_RolePermission;
DROP TABLE IF EXISTS Tbl_Permission;
DROP TABLE IF EXISTS Tbl_User;
DROP TABLE IF EXISTS Tbl_Role;
GO

-- 3. Create Tables
CREATE TABLE Tbl_Role (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    DeleteFlag BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);

CREATE TABLE Tbl_User (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    RoleID INT NOT NULL,
    UserName VARCHAR(30) NOT NULL UNIQUE,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    PasswordHash VARCHAR(255) NOT NULL,
    PhoneNumber VARCHAR(20),
    Status VARCHAR(20) NOT NULL,
    DeleteFlag BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (RoleID) REFERENCES Tbl_Role(RoleID)
);

CREATE TABLE Tbl_Permission (
    PermissionID INT PRIMARY KEY IDENTITY(1,1),
    MenuName VARCHAR(50) NOT NULL,
    ActionName VARCHAR(20) NOT NULL,
    DeleteFlag BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME
);

CREATE TABLE Tbl_RolePermission (
    RolePermissionID INT PRIMARY KEY IDENTITY(1,1),
    RoleID INT NOT NULL,
    PermissionID INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RoleID) REFERENCES Tbl_Role(RoleID),
    FOREIGN KEY (PermissionID) REFERENCES Tbl_Permission(PermissionID)
);

CREATE TABLE Tbl_FoodCategory (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName VARCHAR(100) NOT NULL,
    Description VARCHAR(255),
    CreatedBy INT NOT NULL,
    DeleteFlag BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (CreatedBy) REFERENCES Tbl_User(UserID)
);

CREATE TABLE Tbl_Food (
    FoodID INT PRIMARY KEY IDENTITY(1,1),
    CategoryID INT NOT NULL,
    FoodName VARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX), -- MSSQL recommendation for long text
    Price DECIMAL(10,2) NOT NULL,
    ImageURL VARCHAR(255),
    IsAvailable BIT DEFAULT 1,
    CreatedBy INT NOT NULL,
    DeleteFlag BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (CategoryID) REFERENCES Tbl_FoodCategory(CategoryID),
    FOREIGN KEY (CreatedBy) REFERENCES Tbl_User(UserID)
);

CREATE TABLE Tbl_Order (
    OrderID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    OrderStatus VARCHAR(30) NOT NULL,
    DeleteFlag BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (UserID) REFERENCES Tbl_User(UserID)
);

CREATE TABLE Tbl_OrderItem (
    OrderItemID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL,
    FoodID INT NOT NULL,
    Quantity INT NOT NULL,
    SnapPrice DECIMAL(10,2) NOT NULL,
    SubTotal DECIMAL(10,2) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (OrderID) REFERENCES Tbl_Order(OrderID),
    FOREIGN KEY (FoodID) REFERENCES Tbl_Food(FoodID)
);

CREATE TABLE Tbl_Payment (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL UNIQUE,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod VARCHAR(50),
    PaymentStatus VARCHAR(30),
    DeleteFlag BIT DEFAULT 0,
    PaidAt DATETIME,
    CreatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (OrderID) REFERENCES Tbl_Order(OrderID)
);
GO