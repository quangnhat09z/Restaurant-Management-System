import axios from 'axios';

// Central axios instance for frontend requests to API Gateway
// Adds a header to enable Claude Haiku 4.5 for all clients
const baseURL = import.meta?.env?.VITE_API_GATEWAY_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    'X-Enable-Claude': 'haiku-4.5'
  }
});

export default api;
