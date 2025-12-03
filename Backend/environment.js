// Import .env
// ===================================================
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const DEV_USER = process.env.DEV_USER?.toUpperCase() || 'PHUOC';
function getEnv(key) {
  return process.env[`${key}_${DEV_USER}`];
}

const environment = {
  DEV_USER,
  DB_HOST: getEnv('DB_HOST') || 'localhost',
  DB_USER: getEnv('DB_USER') || 'root',
  DB_PASSWORD: getEnv('DB_PASSWORD') || '',

  //general
  DB_PORT: process.env.DB_PORT,
  PORT_ORDER: process.env.PORT_ORDER,
  PORT_MENU: process.env.PORT_MENU,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  ACCESS_TOKEN_EXPIRY: process.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY: process.REFRESH_TOKEN_EXPIRY,
};
// console.log(environment);

console.log('🧩 Successfully connected to environment for:', DEV_USER);
module.exports = environment;
