// models/link.js
const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  originalUrl: String,
  shortId: String,
  customAlias: String,
  qrCodeUrl: String,
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Link', linkSchema);
