const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register
router.post('/register', async (req, res) => {
    try {
        const { full_name, email, password } = req.body;
        
        // Check if user exists
        const userCheck = await db.query('SELECT id FROM Users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Insert
        const result = await db.query(
            'INSERT INTO Users (full_name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, full_name, email, role',
            [full_name, email, password_hash]
        );

        res.status(201).json({ message: 'Registration successful', user: result.rows[0] });
    } catch (err) {
        console.error('Registration Error Details:', err);
        res.status(500).json({ error: 'Database/Server Error: ' + (err.message || 'Unknown error') });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role } });
            }
        );
    } catch (err) {
        console.error('Login Error Details:', err);
        res.status(500).json({ error: 'Database/Server Error: ' + (err.message || 'Unknown error') });
    }
});

module.exports = router;
