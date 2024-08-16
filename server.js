const express = require('express');
const mongoose = require('mongoose');
const { PORT, MONGO_URI } = require('./config/config');
const path = require('path');
const indexRoutes = require('./routes/index');
const apiRoutes = require('./routes/api');
const rateLimit = require('express-rate-limit');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const QRCode = require('qrcode');

const app = express();

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 
});
app.use('/api', apiLimiter);

//Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
  console.log('Database connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Database disconnected');
});

// Set up EJS with Layouts
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/styles', express.static(path.join(__dirname, 'public/styles')));

// Routes
app.use('/', indexRoutes);
app.use('/api', apiRoutes);

// Example route using layout
app.get('/', (req, res) => {
  res.render('index', { title: 'Scissor URL Shortener', layout: 'layout' });
});

app.get('/history', async (req, res) => {
  const links = await getLinksFromDatabase(); 

  res.render('history', { title: 'Link History', links, layout: 'layout' });
});

app.get('/generate', (req, res) => {
  const url = req.query.url;

  if (!url || typeof url !== 'string') {
      return res.status(400).send('Valid URL is required to generate QR code');
  }

  QRCode.toDataURL(url, (err, src) => {
      if (err) {
          console.error('Error generating QR code:', err);
          return res.status(500).send('Error generating QR code');
      }

      // Pass the title variable here
      res.render('generate', { title: 'QR Code Generator', src });
  });
});



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export app for testing
