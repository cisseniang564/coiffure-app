"use strict";
// routes/auth.ts
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/signup-coiffeur
router.post('/signup-coiffeur', async (req, res) => {
    try {
        const { email, password, salon_name, phone, address, quartier } = req.body;
        if (!email || !password || !salon_name || !phone || !address || !quartier) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const result = await authService_1.AuthService.signupCoiffeur({
            email,
            password,
            salon_name,
            phone,
            address,
            quartier,
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Signup coiffeur error:', error);
        res.status(400).json({ error: error.message || 'Signup failed' });
    }
});
// POST /api/auth/signup-client
router.post('/signup-client', async (req, res) => {
    try {
        const { email, password, first_name, last_name, phone } = req.body;
        if (!email || !password || !first_name || !last_name || !phone) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        const result = await authService_1.AuthService.signupClient({
            email,
            password,
            first_name,
            last_name,
            phone,
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Signup client error:', error);
        res.status(400).json({ error: error.message || 'Signup failed' });
    }
});
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const result = await authService_1.AuthService.login({ email, password });
        res.status(200).json(result);
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ error: error.message || 'Login failed' });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.status(200).json({
            user: req.user,
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST /api/auth/logout
router.post('/logout', auth_1.authMiddleware, (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
});
// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Token required' });
        }
        const result = await authService_1.AuthService.refreshToken(token);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(401).json({ error: 'Token refresh failed' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map