import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername, findUserById } from '../models/userModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { env } from '../config/env.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password are required' });
    }

    const user = await findUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ sub: user.id, username: user.username }, env.jwtSecret, {
      expiresIn: '8h',
    });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await findUserById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
