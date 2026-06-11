const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const https = require('https');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log('MongoDB connected ✅');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000} 🚀`);
    });
  })
  .catch(err => console.log(err));

// Keep Render free tier alive - ping every 14 minutes
setInterval(() => {
  https.get('https://job-tracker-backend-9mbh.onrender.com/api/health', (res) => {
    console.log('Keep alive ping ✅');
  }).on('error', () => {
    console.log('Keep alive ping failed');
  });
}, 14 * 60 * 1000);