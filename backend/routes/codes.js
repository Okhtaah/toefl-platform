const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to verify JWT - ideally put this in a separate middleware file
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

// Redeem an access code
router.post('/redeem', auth, async (req, res) => {
    try {
        const { code } = req.body;
        
        // Find code
        const codeResult = await db.query('SELECT * FROM AccessCodes WHERE code = $1', [code]);
        if (codeResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid code' });
        }
        
        const accessCode = codeResult.rows[0];
        
        // Check expiry and limits
        if (accessCode.expires_at && new Date() > new Date(accessCode.expires_at)) {
            return res.status(400).json({ error: 'Code expired' });
        }
        if (accessCode.current_uses >= accessCode.max_uses) {
            return res.status(400).json({ error: 'Code usage limit reached' });
        }
        
        // Check if already redeemed
        const checkExisting = await db.query(
            'SELECT * FROM UserAccess WHERE user_id = $1 AND access_code_id = $2',
            [req.user.id, accessCode.id]
        );
        if (checkExisting.rows.length > 0) {
            return res.status(400).json({ error: 'You have already redeemed this code' });
        }

        // Redeem!
        await db.query(
            'INSERT INTO UserAccess (user_id, access_code_id, target_type, target_id) VALUES ($1, $2, $3, $4)',
            [req.user.id, accessCode.id, accessCode.target_type, accessCode.target_id]
        );
        await db.query('UPDATE AccessCodes SET current_uses = current_uses + 1 WHERE id = $1', [accessCode.id]);

        res.json({ message: 'Code redeemed successfully!', access: accessCode.target_type });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get My Access
router.get('/my-access', auth, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT target_type, target_id, unlocked_at FROM UserAccess WHERE user_id = $1',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
