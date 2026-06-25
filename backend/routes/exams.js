const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

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

// Get Course and its Tasks
router.get('/:course_id', auth, async (req, res) => {
    try {
        const { course_id } = req.params;
        
        // In a real app we'd fetch Course -> Sections -> Tasks -> Questions.
        // For this UI demo, we'll return the course details and mock the tasks
        // with the new time limits and alert limits feature.
        const courseRes = await db.query('SELECT * FROM Courses WHERE id = $1', [course_id]);
        
        if (courseRes.rows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        
        // We simulate that the admin set these values when building the exam
        const course = courseRes.rows[0];
        
        res.json({
            course_id: course.id,
            title: course.title,
            course_type: course.course_type,
            tasks: [
                {
                    id: 1,
                    title: 'Academic Passage 1',
                    time_limit_seconds: 1200, // 20 minutes
                    alert_time_seconds: 300,  // 5 minutes remaining alert
                    passage: 'The origin of species and evolutionary biology...',
                    questions: [
                        { id: 101, prompt: 'What is the main idea?', options: ['A', 'B', 'C', 'D'], correct: 0 }
                    ]
                }
            ]
        });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
