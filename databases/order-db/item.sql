-- databases/order-db/item.sql
CREATE TABLE IF NOT EXISTS item (
    ItemID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    ItemName VARCHAR(100) NOT NULL,
    TableNumber INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES bill(OrderID) ON DELETE CASCADE,
    INDEX idx_order (OrderID),
    INDEX idx_table (TableNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;