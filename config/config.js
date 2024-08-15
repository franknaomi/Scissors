// config/config.js
require('dotenv').config();


module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  QR_CODE_API_TOKEN: process.env.QR_CODE_API_TOKEN,
  PORT: process.env.PORT || 3000
};
