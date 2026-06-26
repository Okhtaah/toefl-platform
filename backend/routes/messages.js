// messages.js - Backend Route
const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// GET /api/messages — fetch messages for student (their conversation with admin)
router.get('/', auth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT m.id, m.sender_id, m.content, m.created_at,
                   u.full_name AS sender_name
            FROM Messages m
            JOIN Users u ON u.id = m.sender_id
            WHERE (m.sender_id = $1 OR m.receiver_id = $1)
            ORDER BY m.created_at ASC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/messages — send a message to admin
router.post('/', auth, async (req, res) => {
    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Message content required' });
    }

    try {
        // Find the admin user
        const adminRes = await db.query(`SELECT id FROM Users WHERE role = 'admin' LIMIT 1`);
        if (adminRes.rows.length === 0) {
            return res.status(404).json({ error: 'No admin found' });
        }
        const adminId = adminRes.rows[0].id;

        await db.query(`
            INSERT INTO Messages (sender_id, receiver_id, content)
            VALUES ($1, $2, $3)
        `, [req.user.id, adminId, content.trim()]);

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
