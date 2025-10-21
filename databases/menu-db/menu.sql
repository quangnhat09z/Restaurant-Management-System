-- databases/menu-db/menu.sql
CREATE TABLE IF NOT EXISTS menu (
    ItemID INT PRIMARY KEY AUTO_INCREMENT,
    ItemName VARCHAR(100) NOT NULL UNIQUE,
    Category VARCHAR(50) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Description TEXT,
    ImageURL VARCHAR(255),
    IsAvailable BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (Category),
    INDEX idx_available (IsAvailable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Sample data
INSERT INTO menu (ItemName, Category, Price, Description, IsAvailable) VALUES
('Phở Bò', 'Main Course', 50000, 'Traditional Vietnamese beef noodle soup', TRUE),
('Bún Chả', 'Main Course', 45000, 'Grilled pork with rice noodles', TRUE),
('Cơm Tấm', 'Main Course', 40000, 'Broken rice with grilled pork', TRUE),
('Gỏi Cuốn', 'Appetizer', 30000, 'Fresh spring rolls', TRUE),
('Chả Giò', 'Appetizer', 35000, 'Fried spring rolls', TRUE),
('Cà Phê Sữa Đá', 'Beverage', 25000, 'Vietnamese iced coffee with milk', TRUE),
('Trà Đá', 'Beverage', 10000, 'Iced tea', TRUE);