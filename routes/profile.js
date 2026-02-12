import express from 'express';
import authMiddleware from '../middleware/auth.js';
import User from '../models/User.js';
const router = express.Router();

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

export default router;
