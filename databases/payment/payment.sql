-- ============================================
-- DATABASE MIGRATION FOR PAYMENT SYSTEM
-- ============================================

-- 1. Thêm PaymentStatus vào bảng bill
ALTER TABLE bill 
ADD COLUMN PaymentStatus ENUM('unpaid', 'processing', 'completed', 'failed') 
DEFAULT 'unpaid' 
AFTER OrderStatus;

-- 2. Tạo bảng payments
CREATE TABLE IF NOT EXISTS payments (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT NOT NULL,
    TransactionID VARCHAR(50) UNIQUE NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentMethod VARCHAR(20) DEFAULT 'BANK_TRANSFER',
    PaymentStatus ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    BankCode VARCHAR(20),
    BankTransactionNo VARCHAR(50),
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES bill(OrderID) ON DELETE CASCADE,
    INDEX idx_transaction (TransactionID),
    INDEX idx_order (OrderID),
    INDEX idx_status (PaymentStatus)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Update existing orders to have payment status
UPDATE bill 
SET PaymentStatus = CASE 
    WHEN OrderStatus = 'delivered' THEN 'completed'
    WHEN OrderStatus = 'ready' THEN 'unpaid'
    ELSE 'unpaid'
END;

-- 4. Tạo view để query dễ hơn
CREATE OR REPLACE VIEW order_payment_view AS
SELECT 
    b.OrderID,
    b.UserID,
    b.UserName,
    b.ContactNumber,
    b.TotalPrice,
    b.OrderStatus,
    b.PaymentStatus,
    b.CreatedAt as OrderCreatedAt,
    p.PaymentID,
    p.TransactionID,
    p.PaymentMethod,
    p.PaymentStatus as PaymentTransactionStatus,
    p.CreatedAt as PaymentCreatedAt
FROM bill b
LEFT JOIN payments p ON b.OrderID = p.OrderID
ORDER BY b.CreatedAt DESC;

-- 5. Sample data để test (optional)
-- Uncomment nếu muốn test data
/*
INSERT INTO payments (OrderID, TransactionID, Amount, PaymentMethod, PaymentStatus) 
VALUES 
    (1, 'TXN1234567890', 150000, 'BANK_TRANSFER', 'completed'),
    (2, 'TXN1234567891', 200000, 'BANK_TRANSFER', 'pending');
*/

-- Verify migration
SELECT 'Migration completed successfully!' as Status;
SELECT COUNT(*) as TotalOrders FROM bill;
SELECT COUNT(*) as TotalPayments FROM payments;