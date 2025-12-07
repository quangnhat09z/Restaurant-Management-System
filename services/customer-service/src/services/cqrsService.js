const pool = require('../database/db');

/**
 * CQRS Service - Tách biệt Write Store và Read Store
 * - Write Store: Xử lý lệnh ghi (command)
 * - Read Store: Tối ưu cho query đọc
 */

class CQRSService {
  // =================== WRITE OPERATIONS ===================

  /**
   * Ghi dữ liệu vào Write Store
   * @param {Object} userData - Dữ liệu người dùng
   * @returns {number} userID vừa tạo
   */
  async writeUser(userData) {
    const {
      userName,
      email,
      contactNumber,
      password,
      address,
      role = 'user',
    } = userData;

    const [result] = await pool.query(
      `INSERT INTO user_write (userName, email, contactNumber, password, address, role, isActive, createdAt, updatedAt, version)
       VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW(), 1)`,
      [userName, email, contactNumber, password, address, role]
    );

    // Ghi event log cho Event Sourcing
    await this.recordEvent(result.insertId, 'CREATED', {
      userName,
      email,
      role,
    });

    return result.insertId;
  }

  /**
   * Cập nhật dữ liệu vào Write Store
   * @param {number} userID
   * @param {Object} updateData - Dữ liệu cần update
   */
  async updateWriteUser(userID, updateData) {
    // Loại bỏ undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error('No valid fields provided for update');
    }

    // Tạo dynamic query
    const fields = Object.keys(updateData)
      .map((key) => `${key} = ?`)
      .join(', ');
    const values = Object.values(updateData);

    const [result] = await pool.query(
      `UPDATE user_write SET ${fields}, updatedAt = NOW(), version = version + 1 WHERE userID = ?`,
      [...values, userID]
    );

    // Ghi event log
    await this.recordEvent(userID, 'UPDATED', updateData);

    return result;
  }

  /**
   * Xóa người dùng từ Write Store (soft delete)
   * @param {number} userID
   */
  async deleteWriteUser(userID) {
    const [result] = await pool.query(
      `UPDATE user_write SET isActive = FALSE, updatedAt = NOW() WHERE userID = ?`,
      [userID]
    );

    await this.recordEvent(userID, 'DELETED', { userID });
    return result;
  }

  // =================== READ OPERATIONS ===================

  /**
   * Đọc từ Read Store (được tối ưu cho query)
   * @param {number} userID
   * @returns {Object} User data
   */
  async readUserById(userID) {
    const [rows] = await pool.query(
      `SELECT userID, userName, email, contactNumber, address, role, isActive, lastLogin, createdAt, updatedAt
       FROM user_read WHERE userID = ? AND isActive = TRUE`,
      [userID]
    );
    return rows[0];
  }

  /**
   * Tìm kiếm user theo email từ Read Store
   * @param {string} email
   * @returns {Object} User data
   */
  async readUserByEmail(email) {
    const [rows] = await pool.query(
      `SELECT userID, userName, email, contactNumber, address, role, isActive, lastLogin, createdAt, updatedAt
       FROM user_read WHERE email = ? AND isActive = TRUE`,
      [email]
    );
    return rows[0];
  }

  /**
   * Lấy danh sách users từ Read Store (có phân trang)
   * @param {number} page
   * @param {number} limit
   * @param {Object} filters - {role, isActive, etc}
   * @returns {Object} {data, total, page, limit, totalPages}
   */
  async readAllUsers(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;

    // Build WHERE clause từ filters
    let whereClause = 'WHERE isActive = TRUE';
    const params = [];

    if (filters.role) {
      whereClause += ` AND role = ?`;
      params.push(filters.role);
    }
    if (filters.search) {
      whereClause += ` AND (userName LIKE ? OR email LIKE ?)`;
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const [rows] = await pool.query(
      `SELECT userID, userName, email, contactNumber, address, role, isActive, lastLogin, createdAt, updatedAt
       FROM user_read
       ${whereClause}
       ORDER BY createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM user_read ${whereClause}`,
      params
    );

    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // =================== SYNC OPERATIONS (Write → Read) ===================

  /**
   * Đồng bộ từ Write Store sang Read Store
   * Chạy định kỳ (mỗi 15 phút)
   */
  async syncWriteToRead() {
    const syncLogId = await this.startSyncLog('USER_WRITE_TO_READ');

    try {
      console.log(
        '🔄 [CQRS SYNC] Starting sync from Write Store to Read Store...'
      );

      // Lấy thời điểm sync cuối cùng
      const [lastSync] = await pool.query(
        `SELECT lastSyncAt FROM cqrs_sync_log 
         WHERE syncType = 'USER_WRITE_TO_READ' AND status = 'SUCCESS'
         ORDER BY currentSyncAt DESC LIMIT 1`
      );

      const lastSyncTime = lastSync[0]?.lastSyncAt || new Date('2000-01-01');

      // Lấy các user đã thay đổi sau lần sync cuối cùng
      const [changedUsers] = await pool.query(
        `SELECT * FROM user_write WHERE updatedAt > ?`,
        [lastSyncTime]
      );

      console.log(`📊 Found ${changedUsers.length} changed users`);

      // Sync từng user
      for (const user of changedUsers) {
        await this.syncSingleUser(user);
      }

      // Cập nhật sync log
      await this.completeSyncLog(syncLogId, 'SUCCESS', changedUsers.length);

      console.log(
        `✅ [CQRS SYNC] Sync completed! ${changedUsers.length} records synchronized`
      );
      return { success: true, processedCount: changedUsers.length };
    } catch (error) {
      await this.completeSyncLog(syncLogId, 'FAILED', 0, error.message);
      console.error('❌ [CQRS SYNC] Sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Đồng bộ một user
   */
  async syncSingleUser(writeUser) {
    const { userID, password, commandId, ...readableFields } = writeUser;
    const allowedFields = {
      userName: readableFields.userName,
      email: readableFields.email,
      contactNumber: readableFields.contactNumber,
      address: readableFields.address,
      role: readableFields.role,
      isActive: readableFields.isActive,
      lastLogin: readableFields.lastLogin,
      createdAt: readableFields.createdAt,
      updatedAt: readableFields.updatedAt,
      version: readableFields.version,
    };
    const [existing] = await pool.query(
      `SELECT userID FROM user_read WHERE userID = ?`,
      [userID]
    );

    if (existing.length > 0) {
      const updateFields = Object.keys(allowedFields)
        .map((key) => `${key} = ?`)
        .join(', ');
      const updateValues = Object.values(allowedFields);

      await pool.query(
        `UPDATE user_read SET ${updateFields}, syncedAt = NOW() WHERE userID = ?`,
        [...updateValues, userID]
      );
    } else {
      // INSERT
      const columns = Object.keys(allowedFields).join(', ');
      const placeholders = Object.keys(allowedFields)
        .map(() => '?')
        .join(', ');
      const values = Object.values(allowedFields);

      await pool.query(
        `INSERT INTO user_read (userID, ${columns}, syncedAt) VALUES (?, ${placeholders}, NOW())`,
        [userID, ...values]
      );
    }
  }

  // =================== EVENT SOURCING ===================

  /**
   * Ghi sự kiện vào event log
   */
  async recordEvent(userID, eventType, eventData) {
    await pool.query(
      `INSERT INTO user_events (userID, eventType, eventData, createdAt)
       VALUES (?, ?, ?, NOW())`,
      [userID, eventType, JSON.stringify(eventData)]
    );
  }

  /**
   * Lấy lịch sử thay đổi của user
   */
  async getUserHistory(userID) {
    const [events] = await pool.query(
      `SELECT eventId, eventType, eventData, createdAt
       FROM user_events
       WHERE userID = ?
       ORDER BY createdAt DESC`,
      [userID]
    );

    return events.map((e) => {
      let parsedData = e.eventData;

      // Handle nếu eventData là string (cần parse)
      if (typeof e.eventData === 'string') {
        try {
          parsedData = JSON.parse(e.eventData);
        } catch (parseError) {
          console.warn('⚠️ Failed to parse eventData:', e.eventData);
          parsedData = e.eventData; // Giữ nguyên nếu parse fail
        }
      }

      return {
        ...e,
        eventData: parsedData,
      };
    });
  }

  // =================== SYNC LOG ===================

  async startSyncLog(syncType) {
    const [result] = await pool.query(
      `INSERT INTO cqrs_sync_log (syncType, status) VALUES (?, 'IN_PROGRESS')`,
      [syncType]
    );
    return result.insertId;
  }

  async completeSyncLog(
    syncLogId,
    status,
    processedCount,
    errorMessage = null
  ) {
    await pool.query(
      `UPDATE cqrs_sync_log 
       SET status = ?, totalRecordsProcessed = ?, lastSyncAt = NOW(), errorMessage = ?
       WHERE syncId = ?`,
      [status, processedCount, errorMessage, syncLogId]
    );
  }

  /**
   * Lấy trạng thái sync cuối cùng
   */
  async getSyncStatus() {
    const [logs] = await pool.query(
      `SELECT * FROM cqrs_sync_log ORDER BY currentSyncAt DESC LIMIT 5`
    );
    return logs;
  }
}

module.exports = new CQRSService();
