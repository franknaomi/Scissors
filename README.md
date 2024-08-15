# Scissor URL Shortening Service

## Overview

Scissor is a URL shortening service designed to simplify and customize long URLs. It offers features such as URL shortening, custom URLs, QR code generation, basic analytics, and link history management.

## Features

- **URL Shortening**: Convert long URLs into shorter, shareable links.
- **Custom URLs**: Customize the shortened URLs with a custom alias or domain.
- **QR Code Generation**: Generate QR codes for shortened URLs.
- **Analytics**: Track clicks and performance of shortened URLs.
- **Link History**: View and manage the history of created links.

## Project Structure

```
scissor/
│
├── config/
│   └── config.js          # Configuration settings (e.g., database URL, API keys)
│   |__ redis.js           # Configuration for Redis
├── controllers/
│   └── linkController.js  # Handlers for URL shortening, redirection, etc.
│
├── models/
│   └── link.js            # Mongoose model schema for URLs
│
├── public/
│   └── styles/            # Static assets like CSS files
│       └── style.css
│
├── routes/
│   ├── index.js           # Routes for serving the frontend and handling form submissions
│   └── api.js             # API routes for shortening URLs, history, etc.
│
├── views/
|   |__generate.ejs        # Page to display QR Code generated
│   └── index.ejs          # EJS templates for rendering frontend
│   └── history.ejs        # Page to display link history
│   └── layout.ejs         # Layout template for common header and footer
│
├── utils/
│   ├── cache.js           # Cache utility for NodeCache
│   └── qrCodeGenerator.js # QR code generation logic
│
├── tests/
│   ├── linkController.test.js  # Unit tests for linkController
│   └── integration.test.js     # Integration tests for endpoints
│
├── .env                   # Environment variables
├── package.json           # Project metadata and dependencies
├── server.js              # Main server entry point
└── README.md              # Project documentation
```

## Setup and Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/scissor.git
   cd scissor
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configuration**:
   Create a `.env` file in the root directory and add the following environment variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   QR_CODE_API_KEY=your_qr_code_api_key
   PORT=3000
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```

   The server will start on `http://localhost:3000`.

## API Endpoints

### Shorten URL

- **Endpoint**: `POST /shorten`
- **Description**: Shortens a long URL and optionally creates a custom alias.
- **Request Body**:
  ```json
  {
    "originalUrl": "https://example.com",
    "customAlias": "customAlias"  // Optional
  }
  ```
- **Response**:
  ```json
  {
    "shortUrl": "http://localhost:3000/shortid",
    "qrCodeUrl": "http://example.com/qrcode.png"
  }
  ```

### Redirect URL

- **Endpoint**: `GET /:shortId`
- **Description**: Redirects to the original URL based on the shortened ID.
- **Response**: Redirects to the original URL.

### Link History

- **Endpoint**: `GET /history`
- **Description**: Returns a list of all shortened URLs and their metadata.
- **Response**:
  ```json
  [
    {
      "originalUrl": "https://example.com",
      "shortId": "shortid",
      "customAlias": "customAlias",
      "qrCodeUrl": "http://example.com/qrcode.png",
      "clicks": 10,
      "createdAt": "2024-08-14T12:34:56.789Z"
    }
  ]
  ```

## Views

### Home Page (`index.ejs`)

- **Path**: `/`
- **Description**: Provides a form to submit URLs for shortening and displays the shortened URL and QR code if available.

### Link History Page (`history.ejs`)

- **Path**: `/history`
- **Description**: Displays a table of previously shortened URLs with their metadata, including clicks and creation date.

### Layout Template (`layout.ejs`)

- **Path**: Common layout used by other views to provide a consistent header, footer, and styling.

## Utils

### Caching (`cache.js`)

Caching is used to reduce database load and improve performance for frequently accessed data.

- **File**: `utils/cache.js`
- **Description**: Utilizes `NodeCache` to store and retrieve frequently accessed URL data.
- **Code**:
  ```javascript
  // utils/cache.js
  const NodeCache = require('node-cache');
  const cache = new NodeCache();

  module.exports = cache;
  ```

### QR Code Generation (`qrCodeGenerator.js`)

Generates QR codes for shortened URLs using an external API.

- **File**: `utils/qrCodeGenerator.js`
- **Description**: Uses the `QRCode API` to generate QR codes.
- **Code**:
  ```javascript
  // utils/qrCodeGenerator.js
  const axios = require('axios');
  const { QR_CODE_API_KEY } = require('../config/config');  // Ensure QR_CODE_API_KEY is set in your .env

  exports.generateQRCode = async (url) => {
    try {
      const encodedUrl = encodeURIComponent(url);
      const response = await axios.get(`https://api.qr-code-generator.com/v1/create?access-token=${QR_CODE_API_KEY}&qr_code_text=${encodedUrl}`);
      
      if (response.status === 200 && response.data.qr_code_url) {
        return response.data.qr_code_url;
      } else {
        console.error('QR code generation failed:', response.data);
        return '';
      }
    } catch (error) {
      console.error('Error generating QR code', error);
      return '';
    }
  };
  ```

## Caching

**Purpose**: To reduce the number of database queries for frequently accessed data and improve application performance.

- **Cache Layer**: Implemented using `NodeCache`, which provides an in-memory caching layer to store URL shortening data.
- **Implementation**: The cache is used in the `linkController` to store and retrieve shortened URLs and their metadata.

### Example Usage

In `linkController.js`:
```javascript
const cache = require('../utils/cache');

exports.shortenUrl = async (req, res) => {
  const { originalUrl, customAlias } = req.body;
  
  // Validate URL
  try {
    new URL(originalUrl);
  } catch (err) {
    return res.status(400).send('Invalid URL');
  }

  let shortId = customAlias ? customAlias : shortid.generate();
  let shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;

  // Check cache first
  if (cache.get(shortId)) {
    return res.json({ shortUrl: cache.get(shortId).shortUrl, qrCodeUrl: cache.get(shortId).qrCodeUrl });
  }

  // Process URL shortening and cache the result
  let link = await Link.findOne({ originalUrl, customAlias });
  if (!link) {
    link = new Link({
      originalUrl,
      shortId,
      customAlias,
      qrCodeUrl: await generateQRCode(shortUrl)
    });
    await link.save();
  }

  cache.set(shortId, { shortUrl, qrCodeUrl: link.qrCodeUrl });
  res.json({ shortUrl, qrCodeUrl: link.qrCodeUrl });
};
```

## Rate Limiting

**Purpose**: To prevent abuse of the API by limiting the number of requests that can be made by a single client in a given time period.

- **Implementation**: Rate limiting is implemented using the `express-rate-limit` middleware.

### Example Configuration

In `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

// Create a rate limiter for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // Limit each IP to 100 requests per windowMs
});
app.use('/api', apiLimiter);
```

- **Configuration**: Limits each IP address to 100 requests per 15 minutes for API endpoints to prevent abuse.

## Testing

- **Unit Tests**: Located in `tests/linkController.test.js`. Use Mocha, Chai, or Jest to run the tests.
- **Integration Tests**: Located in `tests/integration.test.js`. Ensure endpoints are tested for correct behavior.

### Running Tests

1. **Install Testing Dependencies**:
   ```bash
   npm install --save-dev mocha chai supertest
   ```

2. **Run Tests**:
   ```bash
   npm test
   ```

## Best Practices

- **URL Validation**: Ensure URLs are validated before shortening to avoid broken links.
- **Caching**: Use caching to reduce database load and improve performance for frequently accessed data.
- **

Rate Limiting**: Implement rate limiting to prevent abuse of the API and ensure fair use.
- **Documentation**: Maintain API documentation using tools like Stoplight or Swagger to provide clear guidance on API usage.

## Additional Notes

- **QR Code API**: Ensure you have a valid API key for the QR code generation service and update the `.env` file accordingly.
- **Database**: The service uses MongoDB for storage. Ensure the MongoDB server is running and accessible.

---

This documentation should provide a comprehensive guide to setting up, using, and maintaining the Scissor URL Shortening Service. Feel free to adjust and expand based on any additional features or requirements.