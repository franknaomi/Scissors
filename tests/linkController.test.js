// tests/linkController.test.js
const request = require('supertest');
const app = require('../server'); // Import the server for testing
const mongoose = require('mongoose');
const Link = require('../models/link');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/scissor_test', { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('POST /shorten', () => {
  it('should shorten a URL', async () => {
    const response = await request(app)
      .post('/shorten')
      .send({ originalUrl: 'https://example.com' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('shortUrl');
    expect(response.body).toHaveProperty('qrCodeUrl');
  });
});
