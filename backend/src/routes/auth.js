import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password, display_name } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const existing = await query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
  if (existing.length) return res.status(409).json({ error: 'Username or email already taken' });
  const password_hash = await bcrypt.hash(password, 10);
  const result = await query(
    'INSERT INTO users (username, email, password_hash, display_name, created_at) VALUES (?, ?, ?, ?, NOW())',
    [username, email, password_hash, display_name || username]
  );
  return res.status(201).json({ id: result.insertId, username });
});

router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password) return res.status(400).json({ error: 'Missing fields' });
  const users = await query('SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1', [usernameOrEmail, usernameOrEmail]);
  if (!users.length) return res.status(401).json({ error: 'Invalid credentials' });
  const user = users[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });




  const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, username: user.username, display_name: user.display_name, avatar_url: user.avatar_url, cover_url: user.cover_url, bio: user.bio } });
});


// Get current user by token
router.get('/me', requireAuth, async (req, res) => {
  const rows = await query('SELECT id, username, display_name, avatar_url, cover_url, bio FROM users WHERE id = ?', [req.user.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});


