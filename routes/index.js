const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

router.post('/shorten', linkController.shortenUrl);


// Route to render the history page
router.get('/history', async (req, res) => {
  try {
    const links = await linkController.getLinkHistory();
    res.render('history', { title: 'Link History', links });
  } catch (error) {
    next(error); // Ensure errors are passed to the error handler
  }
});

module.exports = router;
