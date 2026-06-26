const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const codeRoutes = require('./routes/codes');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const examsRoutes = require('./routes/exams');
const messagesRoutes = require('./routes/messages');

app.use('/api/auth', authRoutes);
app.use('/api/codes', codeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/messages', messagesRoutes);
 
// Basic Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TOEFL Platform API is running.' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
