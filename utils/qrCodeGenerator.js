// utils/qrCodeGenerator.js
const axios = require('axios');
const { QR_CODE_API_TOKEN } = require('../config/config');
const QRCode = require('qrcode');

exports.generateQRCode = async (url) => {
  try {
    const response = await axios.get(`https://api.qr-code-generator.com/v1/create?access-token=${QR_CODE_API_TOKEN}&qr_code_text=${encodeURIComponent(url)}`);
    return response.data.qr_code_url;
  } catch (error) {
    console.error('Error generating QR code', error);
    return '';
  }
};



