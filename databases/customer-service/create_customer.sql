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

-- Sample customers (plaintext passwords for local dev; backend uses hashing on register)
INSERT INTO customer (customerName, Email, ContactNumber, Password, Address, createdAt, updatedAt)
VALUES
    ('alice', 'alice@example.com', '+841234567890', 'password123', '123 Hanoi St', NOW(), NOW()),
    ('bob', 'bob@example.com', '+849876543210', 'secret456', '456 Saigon Rd', NOW(), NOW()),
    ('quang', 'quang@example.com', '+84900111222', 'qwerty', '789 Da Nang Ave', NOW(), NOW());
