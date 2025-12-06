class CircuitBreaker {
  constructor() {
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    
    this.threshold = parseInt(process.env.CIRCUIT_BREAKER_THRESHOLD) || 5;
    this.timeout = parseInt(process.env.CIRCUIT_BREAKER_TIMEOUT) || 30000;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceLastFailure > this.timeout) {
        console.log('🟡 Circuit Breaker: HALF_OPEN - Testing service');
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN - Service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 2) {
        console.log('✅ Circuit Breaker: CLOSED - Service recovered');
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      console.log('🔴 Circuit Breaker: OPEN - Too many failures');
      this.state = 'OPEN';
    }
  }

  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      threshold: this.threshold,
      lastFailureTime: this.lastFailureTime
    };
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
    console.log('🔄 Circuit Breaker: RESET');
  }
}

module.exports = new CircuitBreaker();
