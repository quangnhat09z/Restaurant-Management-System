require('dotenv').config({ path: __dirname + '/.env' });

const env = {
  PORT_MENU: process.env.PORT_MENU,
};

module.exports = env;
