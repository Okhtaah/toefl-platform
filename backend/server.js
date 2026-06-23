const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/codes', require('./routes/codes'));
 
// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TOEFL Platform API is running.' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
