-- ================== CQRS Tables ==================
-- Bảng WRITE: Lưu trữ tất cả thay đổi dữ liệu
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
  commandId VARCHAR(255) UNIQUE,  -- Để tracking lệnh (idempotency)
  version INT DEFAULT 1,          -- Để versioning
  
  INDEX idx_user_write_email (email),
  INDEX idx_user_write_userName (userName),
  INDEX idx_user_write_isActive (isActive),
  INDEX idx_user_write_updatedAt (updatedAt)
);

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
  INDEX idx_user_read_role (role)
);

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

-- Sync log: Để tracking quá trình sync
CREATE TABLE IF NOT EXISTS cqrs_sync_log (
  syncId INT PRIMARY KEY AUTO_INCREMENT,
  syncType VARCHAR(100) NOT NULL,        -- 'USER_WRITE_TO_READ'
  lastSyncAt TIMESTAMP,
  currentSyncAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  totalRecordsProcessed INT DEFAULT 0,
  status ENUM('PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  errorMessage TEXT,
  
  INDEX idx_sync_log_status (status),
  INDEX idx_sync_log_currentSyncAt (currentSyncAt)
);

-- Khóa ngoài cho user_read nếu cần soft delete
ALTER TABLE user_read ADD FOREIGN KEY IF NOT EXISTS (userID) REFERENCES user_write(userID) ON DELETE CASCADE;
