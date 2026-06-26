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

// Get Access Codes
router.get('/codes', adminAuth, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM AccessCodes ORDER BY created_at DESC');
        res.json(result.rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Access Code
router.post('/codes', adminAuth, async (req, res) => {
    try {
        const { code, target_type, target_id, max_uses } = req.body;
        // Check if target_id exists (Mocking for now to avoid foreign key crash if target_id is invalid)
        // Usually you'd validate target_id against Courses or Tasks table
        const result = await db.query(
            'INSERT INTO AccessCodes (code, target_type, target_id, max_uses) VALUES ($1, $2, $3, $4) RETURNING *',
            [code, target_type, target_id, max_uses]
        );
        res.json(result.rows[0]);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Pending Submissions
router.get('/submissions', adminAuth, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT s.id, s.text_response, s.audio_response_url, s.submitted_at, 
                   u.full_name, q.prompt, t.task_type
            FROM Submissions s
            JOIN TestAttempts a ON s.attempt_id = a.id
            JOIN Users u ON a.user_id = u.id
            JOIN Questions q ON s.question_id = q.id
            JOIN Tasks t ON q.task_id = t.id
            WHERE s.review_status = 'PENDING_REVIEW'
        `);
        res.json(result.rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Grade Submission
router.put('/submissions/:id/grade', adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const { score, feedback } = req.body;
        await db.query(
            'UPDATE Submissions SET manual_score = $1, admin_feedback = $2, review_status = $3 WHERE id = $4',
            [score, feedback, 'MANUALLY_GRADED', id]
        );
        res.json({ message: 'Grade saved' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Bulk Import Questions
router.post('/questions/bulk', adminAuth, async (req, res) => {
    try {
        const { task_id, questions } = req.body;
        
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            const qResult = await db.query(
                'INSERT INTO Questions (task_id, prompt, question_order) VALUES ($1, $2, $3) RETURNING id',
                [task_id, q.prompt, i]
            );
            
            const newQId = qResult.rows[0].id;
            
            if (q.options && Array.isArray(q.options)) {
                for (let j = 0; j < q.options.length; j++) {
                    await db.query(
                        'INSERT INTO AnswerOptions (question_id, content, is_correct, option_order) VALUES ($1, $2, $3, $4)',
                        [newQId, q.options[j], j === q.correct, j]
                    );
                }
            }
        }
        res.json({ message: 'Bulk imported successfully' });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// Fetch Questions with Search and Filter
router.get('/questions', adminAuth, async (req, res) => {
    try {
        const { search, type } = req.query;
        let query = `
            SELECT q.id, q.prompt, t.task_type 
            FROM Questions q 
            JOIN Tasks t ON q.task_id = t.id 
            WHERE 1=1
        `;
        const params = [];
        
        if (search) {
            params.push(`%${search}%`);
            query += ` AND q.prompt ILIKE $${params.length}`;
        }
        if (type) {
            params.push(type);
            query += ` AND t.task_type = $${params.length}`;
        }
        
        query += ' ORDER BY q.id DESC LIMIT 50';
        
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
