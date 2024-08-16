const shortid = require('shortid');
const Link = require('../models/link');
const { generateQRCode } = require('../utils/qrCodeGenerator');
const client = require('../utils/cache');

exports.shortenUrl = async (req, res) => {
  const url = req.body.url;

  if (!url) {
    return res.status(400).send('URL is required to shorten');

    // Generate a short ID
    const shortUrl = `https://yourdomain.com/${shortid.generate()}`;

    // Render the `shorten` view with the `shortUrl` and a `title`
    res.render('shorten', {
      title: 'URL Shortened',  // Pass the title here
      shortUrl: shortUrl
    });
  };


const shortId = shortid.generate();
const shortUrl = `${req.protocol}://${req.get('host')}/${shortId}`;

if (cache.get(shortId)) {
  return res.json({ shortUrl: cache.get(shortId).shortUrl, qrCodeUrl: cache.get(shortId).qrCodeUrl });
}

let link = await Link.findOne({ originalUrl: url });

if (!link) {
  link = new Link({
    originalUrl: url,
    shortId,
    qrCodeUrl: await generateQRCode(shortUrl)
  });
  await link.save();
}

cache.set(shortId, { shortUrl, qrCodeUrl: link.qrCodeUrl });

res.render('shorten', { shortUrl: link.shortUrl });
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

// Get link history
exports.getLinkHistory = async () => {
  try {
    // Fetch link history from the database
    const links = await Link.find().sort({ createdAt: -1 });
    return links;
  } catch (error) {
    console.error('Error fetching link history:', error);
    throw error;
  }
};
