
-- Sample order 1
INSERT INTO bill (CustomerName, ContactNumber, TotalPrice, OrderStatus) 
VALUES ('Nguyễn Văn A', '0901234567', 150000, 'pending');

SET @order_id = LAST_INSERT_ID();

INSERT INTO item (OrderID, ItemName, TableNumber, Quantity, Price) VALUES
(@order_id, 'Phở Bò', 5, 2, 50000),
(@order_id, 'Cà Phê Sữa Đá', 5, 2, 25000);

-- Sample order 2
INSERT INTO bill (CustomerName, ContactNumber, TotalPrice, OrderStatus) 
VALUES ('Trần Thị B', '0912345678', 95000, 'preparing');

SET @order_id = LAST_INSERT_ID();

INSERT INTO item (OrderID, ItemName, TableNumber, Quantity, Price) VALUES
(@order_id, 'Bún Chả', 8, 1, 45000),
(@order_id, 'Trà Đá', 8, 5, 10000);


select * from bill;
select * from item;