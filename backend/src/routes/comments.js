import express from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const router = express.Router();

router.get('/:postId', async (req, res) => {
  const postId = req.params.postId;
  const rows = await query(
    `SELECT c.*, u.username, u.display_name, u.avatar_url
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.post_id = ? AND c.is_deleted = 0
     ORDER BY c.created_at ASC`,
    [postId]
  );
  res.json(rows);
});

router.post('/:postId', requireAuth, async (req, res) => {
  const postId = req.params.postId;
  const { content, parent_id } = req.body;
  const result = await query(
    'INSERT INTO comments (post_id, user_id, parent_id, content, is_deleted, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
    [postId, req.user.id, parent_id || null, content || '']
  );
  res.status(201).json({ id: result.insertId });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await query('UPDATE comments SET is_deleted = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ ok: true });
});


