const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Admin Middleware
const adminAuth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        if(decoded.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Get all users
router.get('/users', adminAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT id, full_name, email, role, created_at FROM Users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle User Role
router.put('/users/:id/role', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { newRole } = req.body; // 'ADMIN' or 'STUDENT'
        await db.query('UPDATE Users SET role = $1 WHERE id = $2', [newRole, id]);
        res.json({ message: 'Role updated successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Course/Practice
router.post('/courses', adminAuth, async (req, res) => {
    try {
        const { title, description, course_type } = req.body;
        const result = await db.query(
            'INSERT INTO Courses (title, description, course_type) VALUES ($1, $2, $3) RETURNING *',
            [title, description, course_type]
        );
        res.json(result.rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
