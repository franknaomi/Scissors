// // routes/index.js
// const express = require('express');
// const router = express.Router();
// const linkController = require('../controllers/linkController');

// router.get('/', (req, res) => {
//   res.render('index', { title: 'Scissor URL Shortener' });
// });

// router.post('/shorten', linkController.shortenUrl);

// router.get('/history', async (req, res) => {
//   const links = await linkController.getLinkHistory();
//   res.render('history', { title: 'Link History', links });
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const linkController = require('../controllers/linkController');

// Route to render the index page
// router.get('/', (req, res) => {
//   res.render('index', { title: 'Scissor URL Shortener' });
// });

// Route to handle URL shortening
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
