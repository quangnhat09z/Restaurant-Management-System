const axios = require('axios');
const path = require('path');
const circuitBreaker = require('../middleware/circuitBreaker');
const retryHandler = require('../middleware/retryHandler');

// Load .env
require('dotenv').config({ path: path.join(__dirname, '../../../../.env') });

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';

class AmbassadorService {
  async createPayment(paymentData) {
    return await circuitBreaker.execute(async () => {
      return await retryHandler.executeWithRetry(async () => {
        const response = await axios.post(
          `${PAYMENT_SERVICE_URL}/api/payments/create`,
          paymentData,
          { timeout: 10000 }
        );
        return response.data;
      }, 'Create Payment');
    });
  }

  async handleCallback(callbackData) {
    return await circuitBreaker.execute(async () => {
      return await retryHandler.executeWithRetry(async () => {
        const response = await axios.post(
          `${PAYMENT_SERVICE_URL}/api/payments/callback`,
          callbackData,
          { timeout: 10000 }
        );
        return response.data;
      }, 'Payment Callback');
    });
  }

  async getPaymentByOrder(orderId) {
    try {
      const response = await axios.get(
        `${PAYMENT_SERVICE_URL}/api/payments/order/${orderId}`,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Get payment failed for order ${orderId}:`, error.message);
      throw error;
    }
  }

  async getPaymentByTransaction(transactionId) {
    try {
      const response = await axios.get(
        `${PAYMENT_SERVICE_URL}/api/payments/transaction/${transactionId}`,
        { timeout: 5000 }
      );
      return response.data;
    } catch (error) {
      console.error(`❌ Get payment failed for transaction ${transactionId}:`, error.message);
      throw error;
    }
  }
}

module.exports = new AmbassadorService();