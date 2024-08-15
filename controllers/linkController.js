const shortid = require('shortid');
const Link = require('../models/link');
const { generateQRCode } = require('../utils/qrCodeGenerator');
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

  // Check if URL already exists
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

  // Cache the result
  cache.set(shortId, { shortUrl, qrCodeUrl: link.qrCodeUrl });

  res.json({ shortUrl, qrCodeUrl: link.qrCodeUrl });
};

exports.redirectUrl = async (req, res) => {
  const { shortId } = req.params;
  const link = await Link.findOne({ shortId });

  if (!link) {
    return res.status(404).send('Not Found');
  }

  link.clicks += 1;
  await link.save();

  res.redirect(link.originalUrl);
};

exports.getLinkHistory = async (req, res) => {
//   const links = await Link.find({});
//   res.json(links);

try {
    // Fetch link history from the database
    const links = await Link.find().sort({ createdAt: -1 }); // Example query
    return links;
  } catch (error) {
    console.error('Error fetching link history:', error);
    throw error; // Ensure errors are thrown to be handled
  }
};

// // controllers/linkController.js
// exports.getLinkHistory = async () => {
//     return await Link.find({});
//   };
  