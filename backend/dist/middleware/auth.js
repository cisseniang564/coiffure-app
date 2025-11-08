"use strict";
// middleware/auth.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isClientMiddleware = exports.isCoiffeurMiddleware = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }
        const token = authHeader.slice(7);
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.sub,
            email: decoded.email,
            user_type: decoded.user_type,
            salon_id: decoded.salon_id,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
const isCoiffeurMiddleware = (req, res, next) => {
    if (!req.user || req.user.user_type !== 'coiffeur') {
        return res.status(403).json({ error: 'Only coiffeurs can access this' });
    }
    next();
};
exports.isCoiffeurMiddleware = isCoiffeurMiddleware;
const isClientMiddleware = (req, res, next) => {
    if (!req.user || req.user.user_type !== 'client') {
        return res.status(403).json({ error: 'Only clients can access this' });
    }
    next();
};
exports.isClientMiddleware = isClientMiddleware;
//# sourceMappingURL=auth.js.map