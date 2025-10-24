require('dotenv').config({ path: __dirname + '/.env' });

const env = {
  PORT_ORDER: process.env.PORT_ORDER,
};

module.exports = env;
