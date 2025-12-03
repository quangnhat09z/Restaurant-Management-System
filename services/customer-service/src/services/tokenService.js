// services/customer-service/src/services/tokenService.js
const jwt = require('jsonwebtoken');
const redisClient = require('../config/redisClient');
const env = require('../../../../Backend/environment');

const JWT_SECRET = env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = env.REFRESH_SECRET || 'your-refresh-secret-key';
const ACCESS_TOKEN_EXPIRY = env.ACCESS_TOKEN_EXPIRY || '60m';
const REFRESH_TOKEN_EXPIRY = env.REFRESH_TOKEN_EXPIRY || '7d';

// Tạo Access Token
const createAccessToken = (user) => {
  const payload = {
    userID: user.userID,
    email: user.email,
    userName: user.userName,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

// Tạo Refresh Token
const createRefreshToken = (user) => {
  const payload = {
    userID: user.userID,
    email: user.email,
  };

  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

// Lưu Refresh Token vào Redis (để quản lý session)
const saveRefreshToken = async (userID, refreshToken) => {
  const key = `refreshToken:${userID}`;
  const ttl = 7 * 24 * 60 * 60; // 7 days in seconds

  try {
    await redisClient.setEx(key, ttl, refreshToken);
    console.log(`✅ Refresh token saved for user ${userID}`);
  } catch (err) {
    console.error('Error saving refresh token:', err);
    throw err;
  }
};

// Xóa Refresh Token (logout)
const removeRefreshToken = async (userID) => {
  const key = `refreshToken:${userID}`;

  try {
    await redisClient.del(key);
    console.log(`✅ Refresh token removed for user ${userID}`);
  } catch (err) {
    console.error('Error removing refresh token:', err);
    throw err;
  }
};

// Kiểm tra Refresh Token còn hợp lệ
const verifyRefreshToken = async (userID, refreshToken) => {
  const key = `refreshToken:${userID}`;

  try {
    const storedToken = await redisClient.get(key);

    if (!storedToken) {
      throw new Error('Refresh token not found (user logged out)');
    }

    if (storedToken !== refreshToken) {
      throw new Error('Refresh token mismatch');
    }

    // Verify JWT signature
    jwt.verify(refreshToken, REFRESH_SECRET);
    return true;
  } catch (err) {
    console.error('Refresh token verification failed:', err.message);
    throw err;
  }
};

// Refresh Access Token
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Kiểm tra token trong Redis
    const key = `refreshToken:${decoded.userID}`;
    const storedToken = await redisClient.get(key);

    if (!storedToken || storedToken !== refreshToken) {
      throw new Error('Refresh token invalid or expired');
    }

    // Tạo access token mới
    const payload = {
      userID: decoded.userID,
      email: decoded.email,
    };

    const newAccessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    });

    return newAccessToken;
  } catch (err) {
    console.error('Error refreshing access token:', err.message);
    throw err;
  }
};

// Blacklist token khi logout (optional - để extra security)
const blacklistToken = async (userID, token) => {
  const key = `blacklist:${userID}`;
  const ttl = 15 * 60; // 15 minutes (hoặc hết hạn của token)

  try {
    await redisClient.setEx(key, ttl, token);
    console.log(`✅ Token blacklisted for user ${userID}`);
  } catch (err) {
    console.error('Error blacklisting token:', err);
    throw err;
  }
};

// Kiểm tra token có bị blacklist không
const isTokenBlacklisted = async (userID, token) => {
  const key = `blacklist:${userID}`;

  try {
    const blacklistedToken = await redisClient.get(key);
    return blacklistedToken === token;
  } catch (err) {
    console.error('Error checking blacklist:', err);
    return false;
  }
};

module.exports = {
  createAccessToken,
  createRefreshToken,
  saveRefreshToken,
  removeRefreshToken,
  verifyRefreshToken,
  refreshAccessToken,
  blacklistToken,
  isTokenBlacklisted,
};
