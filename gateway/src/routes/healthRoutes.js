// routes/healthRoutes.js
const express = require('express');
const serviceRegistry = require('../config/serviceRegistry');

const router = express.Router();

// Health check cho gateway
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'api-gateway',
    uptime: process.uptime()
  });
});

// Health check cho các service con
router.get('/health/services', async (req, res) => {
  const healthChecks = await Promise.allSettled(
    Object.entries(serviceRegistry).map(async ([name, config]) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(`${config.url}/health`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        return {
          service: name,
          status: response.ok ? 'UP' : 'DOWN',
          url: config.url
        };
      } catch (error) {
        return {
          service: name,
          status: 'DOWN',
          error: error.message,
          url: config.url
        };
      }
    })
  );

  const services = healthChecks.map(result =>
    result.status === 'fulfilled' ? result.value : {
      service: 'unknown',
      status: 'ERROR',
      error: result.reason?.message
    }
  );

  const allUp = services.every(s => s.status === 'UP');

  res.status(allUp ? 200 : 503).json({
    gateway: 'UP',
    overall_status: allUp ? 'HEALTHY' : 'DEGRADED',
    services
  });
});

module.exports = router;
