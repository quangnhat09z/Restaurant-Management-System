const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../../.env') });

class RetryHandler {
  constructor() {
    // Đọc config từ .env
    this.maxRetries = parseInt(process.env.MAX_RETRIES) || 3;
    this.retryDelay = parseInt(process.env.RETRY_DELAY) || 1000;
  }

  async executeWithRetry(fn, context = '') {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔄 ${context} - Attempt ${attempt}/${this.maxRetries}`);
        const result = await fn();
        
        if (attempt > 1) {
          console.log(`✅ ${context} - Succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        console.error(`❌ ${context} - Attempt ${attempt} failed:`, error.message);

        if (attempt === this.maxRetries) {
          console.error(`💥 ${context} - All ${this.maxRetries} attempts failed`);
          throw error;
        }

        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ ${context} - Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new RetryHandler();