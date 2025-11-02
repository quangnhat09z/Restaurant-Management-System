-- Tạo database
CREATE DATABASE IF NOT EXISTS restaurant_customer
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE restaurant_customer;

-- Tạo bảng customer
CREATE TABLE IF NOT EXISTS customer (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    customerName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    ContactNumber VARCHAR(20) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
