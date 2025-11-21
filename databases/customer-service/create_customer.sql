-- Tạo database
CREATE DATABASE IF NOT EXISTS restaurant_user
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE restaurant_user;

-- Tạo bảng user
CREATE TABLE IF NOT EXISTS user (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    userName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    ContactNumber VARCHAR(20) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Address VARCHAR(255),
    Role ENUM('admin', 'user') DEFAULT 'user',
    IsActive BOOLEAN DEFAULT TRUE,
    LastLogin DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


