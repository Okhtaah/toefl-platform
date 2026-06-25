const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Auth Middleware
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Get Dashboard Progress
router.get('/progress', auth, async (req, res) => {
    try {
        // Fetch all attempts for the user
        const attemptsResult = await db.query(`
            SELECT t.id, t.status, t.total_score, t.start_time, c.title, c.course_type 
            FROM TestAttempts t
            JOIN Courses c ON t.course_id = c.id
            WHERE t.user_id = $1
            ORDER BY t.start_time DESC
        `, [req.user.id]);

        // Get count of materials opened/unlocked
        const materialsResult = await db.query(`
            SELECT COUNT(*) FROM UserAccess 
            WHERE user_id = $1 AND target_type = 'MATERIAL'
        `, [req.user.id]);

        res.json({
            attempts: attemptsResult.rows,
            materials_opened: parseInt(materialsResult.rows[0].count)
        });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Available Courses/Materials
router.get('/courses', auth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Courses WHERE is_published = TRUE ORDER BY title ASC');
        res.json(result.rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
