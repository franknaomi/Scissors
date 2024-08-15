// routes/api.js
const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

router.get('/:shortId', linkController.redirectUrl);
router.get('/history', linkController.getLinkHistory);

module.exports = router;
