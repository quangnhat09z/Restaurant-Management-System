-- Tạo database
CREATE DATABASE IF NOT EXISTS restaurant_user
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Sử dụng database
USE restaurant_user;

-- ==================== CQRS WRITE STORE ====================
-- Bảng WRITE: Lưu trữ tất cả thay đổi dữ liệu (Command)
CREATE TABLE IF NOT EXISTS user_write (
  userID INT PRIMARY KEY AUTO_INCREMENT,
  userName VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  contactNumber VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  address TEXT,
  role ENUM('user', 'admin', 'staff') DEFAULT 'user',
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- CQRS metadata
  commandId VARCHAR(255) UNIQUE,
  version INT DEFAULT 1,
  
  INDEX idx_user_write_email (email),
  INDEX idx_user_write_userName (userName),
  INDEX idx_user_write_isActive (isActive),
  INDEX idx_user_write_updatedAt (updatedAt)
);

-- ==================== CQRS READ STORE ====================
-- Bảng READ: Tối ưu cho query/read (denormalized)
CREATE TABLE IF NOT EXISTS user_read (
  userID INT PRIMARY KEY,
  userName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contactNumber VARCHAR(20),
  address TEXT,
  role ENUM('user', 'admin', 'staff') DEFAULT 'user',
  isActive BOOLEAN DEFAULT TRUE,
  lastLogin TIMESTAMP NULL,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  
  -- CQRS metadata
  version INT DEFAULT 1,
  syncedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_read_email (email),
  INDEX idx_user_read_userName (userName),
  INDEX idx_user_read_isActive (isActive),
  INDEX idx_user_read_role (role),
  FOREIGN KEY (userID) REFERENCES user_write(userID) ON DELETE CASCADE
);

-- ==================== EVENT SOURCING ====================
-- Event log: Để lưu lịch sử thay đổi (Event Sourcing)
CREATE TABLE IF NOT EXISTS user_events (
  eventId INT PRIMARY KEY AUTO_INCREMENT,
  userID INT NOT NULL,
  eventType ENUM('CREATED', 'UPDATED', 'DELETED', 'STATUS_CHANGED') NOT NULL,
  eventData JSON NOT NULL,
  commandId VARCHAR(255),
  version INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userID) REFERENCES user_write(userID) ON DELETE CASCADE,
  INDEX idx_user_events_userID (userID),
  INDEX idx_user_events_eventType (eventType),
  INDEX idx_user_events_createdAt (createdAt)
);

-- ==================== CQRS SYNC LOG ====================
-- Sync log: Để tracking quá trình sync
CREATE TABLE IF NOT EXISTS cqrs_sync_log (
  syncId INT PRIMARY KEY AUTO_INCREMENT,
  syncType VARCHAR(100) NOT NULL,
  lastSyncAt TIMESTAMP,
  currentSyncAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  totalRecordsProcessed INT DEFAULT 0,
  status ENUM('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  errorMessage TEXT,
  
  INDEX idx_sync_log_status (status),
  INDEX idx_sync_log_currentSyncAt (currentSyncAt)
);

-- ==================== MIGRATION: Copy data từ user_legacy sang CQRS (nếu cần) ====================
-- INSERT INTO user_write (userName, email, contactNumber, password, address, role, isActive, lastLogin, createdAt, updatedAt)
-- SELECT userName, email, contactNumber, password, address, role, isActive, lastLogin, createdAt, updatedAt FROM user_legacy;

-- UPDATE user_write SET role = 'admin' WHERE userID = 1;


USE restaurant_user;

-- EXPLAIN ANALYZE
-- SELECT * FROM user_read WHERE email = 'user9999@example.com';





-- EXPLAIN ANALYZE
-- SELECT * FROM user_read WHERE userName = 'User10000';


CREATE INDEX idx_user_read_email ON user_read(email);
CREATE INDEX idx_user_read_userName ON user_read(userName);
CREATE INDEX idx_user_read_isActive ON user_read(isActive);
CREATE INDEX idx_user_read_role ON user_read(role);
CREATE INDEX idx_user_read_updatedAt ON user_read(updatedAt);
CREATE INDEX idx_user_read_search ON user_read(userName, email);