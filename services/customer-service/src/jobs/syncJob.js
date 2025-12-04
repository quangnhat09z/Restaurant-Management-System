const cqrsService = require('../services/cqrsService');

/**
 * Sync Job - Đồng bộ dữ liệu từ Write Store sang Read Store
 * Chạy định kỳ mỗi 15 phút
 */

let syncJobInterval = null;
const SYNC_INTERVAL = 15 * 60 * 1000; // 15 phút = 900,000ms

class SyncJobManager {
  /**
   * Bắt đầu sync job
   */
  static startSyncJob() {
    console.log('🚀 [SYNC JOB] Starting CQRS sync job...');
    console.log(
      `⏱️  [SYNC JOB] Sync will run every ${SYNC_INTERVAL / 1000 / 60} minutes`
    );

    // Chạy sync lần đầu ngay lập tức
    this.executeSyncNow();

    // Sau đó chạy định kỳ
    syncJobInterval = setInterval(() => {
      this.executeSyncNow();
    }, SYNC_INTERVAL);

    console.log('✅ [SYNC JOB] CQRS sync job started successfully');
  }

  /**
   * Thực hiện sync ngay lập tức
   */
  static async executeSyncNow() {
    try {
      console.log(
        `\n⏰ [SYNC JOB] Executing sync at ${new Date().toISOString()}`
      );
      const result = await cqrsService.syncWriteToRead();
      console.log(
        `✅ [SYNC JOB] Sync completed! Processed: ${result.processedCount} records\n`
      );
    } catch (error) {
      console.error(`❌ [SYNC JOB] Sync failed: ${error.message}\n`);
    }
  }

  /**
   * Dừng sync job
   */
  static stopSyncJob() {
    if (syncJobInterval) {
      clearInterval(syncJobInterval);
      syncJobInterval = null;
      console.log('🛑 [SYNC JOB] CQRS sync job stopped');
    }
  }

  /**
   * Kiểm tra trạng thái sync job
   */
  static getSyncStatus() {
    return {
      isRunning: syncJobInterval !== null,
      syncInterval: `${SYNC_INTERVAL / 1000 / 60} minutes`,
    };
  }
}

module.exports = SyncJobManager;
