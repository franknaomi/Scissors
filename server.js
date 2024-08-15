// // server.js
// const express = require('express');
// const mongoose = require('mongoose');
// const { PORT, MONGO_URI } = require('./config/config');
// const path = require("path")
// const indexRoutes = require('./routes/index');
// const apiRoutes = require('./routes/api');
// const rateLimit = require('express-rate-limit');
// require("dotenv").config()

// const app = express();

// // Rate Limiting
// const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 100 // Limit each IP to 100 requests per windowMs
//   });
//   app.use('/api', apiLimiter);

// // Connect to MongoDB
// mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// mongoose.connection.on('connected', () => {
//   console.log('Database connected successfully');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('MongoDB connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('Database disconnected');
// });

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // Middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/styles', express.static(path.join(__dirname, 'public/styles')));



// app.use((req, res, next) => {
//     res.renderWithLayout = (view, options) => {
//       res.render(view, { ...options, _layout: false }, (err, contentHtml) => {
//         if (err) return next(err);
//         res.render('layout', {
//           title: options.title || 'Default Title',
//           body: contentHtml
//         });
//       });
//     };
//     next();
//   });
  

// // Routes
// app.use('/', indexRoutes);
// app.use('/api', apiRoutes);

// // Middleware to handle layout rendering
// app.use((req, res, next) => {
//     res.renderWithLayout = (view, options) => {
//       // Render content view
//       res.render(view, { ...options, _layout: false }, (err, contentHtml) => {
//         if (err) return next(err);
//         // Render layout with content
//         res.render('layout', { 
//           title: options.title || 'Default Title',
//           body: contentHtml
//         });
//       });
//     };
//     next();
//   });
  
//   // Route examples
//   app.get('/', (req, res) => {
//     res.renderWithLayout('index', { title: 'Scissor URL Shortener' });
//   });
//   app.get('/', (req, res) => {
//     res.render('index', {
//       title: 'Scissor URL Shortener',
//       body: '<form action="/shorten" method="POST">...</form>'
//     });
//   });
  
//   app.get('/history', async (req, res) => {
//     // Fetch links from the database or some service
//     const links = await getLinksFromDatabase(); // Replace with actual function
  
//     res.renderWithLayout('history', { title: 'Link History', links });
//   });


// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app; // Export app for testing


// server.js
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use('/api', apiLimiter);

// Connect to MongoDB
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
  // Fetch links from the database or some service
  const links = await getLinksFromDatabase(); // Replace with actual function

  res.render('history', { title: 'Link History', links, layout: 'layout' });
});

// fred
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
