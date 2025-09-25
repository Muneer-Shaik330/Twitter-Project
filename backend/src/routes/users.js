import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

router.get('/:id', async (req, res) => {
  const users = await query('SELECT id, username, display_name, bio, avatar_url, cover_url, created_at FROM users WHERE id = ?', [req.params.id]);
  if (!users.length) return res.status(404).json({ error: 'Not found' });
  res.json(users[0]);
});

// Search users by username or display_name
router.get('/search/q', async (req, res) => {
  const q = (req.query.q || '').trim();
  if (!q) return res.json([]);
  const rows = await query(
    'SELECT id, username, display_name, avatar_url FROM users WHERE username LIKE ? OR display_name LIKE ? ORDER BY username LIMIT 10',
    [`%${q}%`, `%${q}%`]
  );
  res.json(rows);
});

// Summary with follower/following counts and follow status
router.get('/:id/summary', requireAuth, async (req, res) => {
  const [user] = await query('SELECT id, username, display_name, bio, avatar_url, cover_url FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'Not found' });
  const [{ followers }] = await query('SELECT COUNT(*) AS followers FROM follows WHERE following_id = ?', [req.params.id]);
  const [{ following }] = await query('SELECT COUNT(*) AS following FROM follows WHERE follower_id = ?', [req.params.id]);
  const [{ is_following }] = await query('SELECT COUNT(*) AS is_following FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
  res.json({ ...user, followers, following, is_following: !!is_following });
});

router.put('/me', requireAuth, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  const { display_name, bio } = req.body;
  const avatar = req.files?.avatar?.[0]?.filename;
  const cover = req.files?.cover?.[0]?.filename;
  const updates = [];
  const params = [];
  if (display_name !== undefined) { updates.push('display_name = ?'); params.push(display_name); }
  if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
  if (avatar) { updates.push('avatar_url = ?'); params.push(`/uploads/${avatar}`); }
  if (cover) { updates.push('cover_url = ?'); params.push(`/uploads/${cover}`); }
  if (!updates.length) return res.json({ ok: true });
  params.push(req.user.id);
  if (updates.length) {
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
  }
  const me = await query('SELECT id, username, display_name, bio, avatar_url, cover_url FROM users WHERE id = ?', [req.user.id]);
  res.json(me[0]);
});

router.post('/:id/follow', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.id);
  if (targetId === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });
  await query('INSERT IGNORE INTO follows (follower_id, following_id, created_at) VALUES (?, ?, NOW())', [req.user.id, targetId]);
  res.json({ ok: true });
});

router.delete('/:id/follow', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.id);
  await query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, targetId]);
  res.json({ ok: true });
});


