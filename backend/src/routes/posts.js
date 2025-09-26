import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

export const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
// Ensure uploads directory exists at runtime
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});
const upload = multer({ storage });

router.get('/feed', requireAuth, async (req, res) => {
  const rows = await query(
    `SELECT p.*, u.username, u.display_name, u.avatar_url,
            EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS liked,
            EXISTS(SELECT 1 FROM reposts rp WHERE rp.post_id = p.id AND rp.user_id = ?) AS reposted,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) AS repost_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) AS comment_count
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.is_deleted = 0 AND (
       p.user_id = ? OR p.user_id IN (SELECT following_id FROM follows WHERE follower_id = ?)
     )
     ORDER BY p.created_at DESC
     LIMIT 50`,
    [req.user.id, req.user.id, req.user.id, req.user.id]
  );
  const ids = rows.map(r => r.id);
  const images = ids.length ? await query(`SELECT id, post_id, url FROM post_images WHERE is_deleted = 0 AND post_id IN (${ids.map(() => '?').join(',')})`, ids) : [];
  const postIdToImages = images.reduce((acc, img) => {
    acc[img.post_id] = acc[img.post_id] || [];
    acc[img.post_id].push({ id: img.id, url: img.url });
    return acc;
  }, {});
  res.json(rows.map(r => ({
    ...r,
    images: postIdToImages[r.id] || []
  })));
});

// Posts by user
router.get('/user/:userId', requireAuth, async (req, res) => {
  const targetId = parseInt(req.params.userId);
  const showOnlyDeleted = req.query.include_deleted === '1' && targetId === req.user.id;

  if (showOnlyDeleted) {
    const rows = await query(
      `SELECT p.*, u.username, u.display_name, u.avatar_url,
              EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS liked,
              EXISTS(SELECT 1 FROM reposts rp WHERE rp.post_id = p.id AND rp.user_id = ?) AS reposted,
              (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) AS repost_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.is_deleted = 1 AND p.user_id = ?
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [req.user.id, req.user.id, targetId]
    );
    const ids = rows.map(r => r.id);
    const images = ids.length ? await query(`SELECT id, post_id, url FROM post_images WHERE is_deleted = 0 AND post_id IN (${ids.map(() => '?').join(',')})`, ids) : [];
    const postIdToImages = images.reduce((acc, img) => {
      acc[img.post_id] = acc[img.post_id] || [];
      acc[img.post_id].push({ id: img.id, url: img.url });
      return acc;
    }, {});
    return res.json(rows.map(r => ({ ...r, images: postIdToImages[r.id] || [] })));
  }

  // Normal profile view: own posts + posts the user reposted
  const ownPosts = await query(
    `SELECT p.*, u.username, u.display_name, u.avatar_url,
            EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS liked,
            EXISTS(SELECT 1 FROM reposts rp2 WHERE rp2.post_id = p.id AND rp2.user_id = ?) AS reposted,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) AS repost_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) AS comment_count,
            NULL AS reposted_at
     FROM posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.is_deleted = 0 AND p.user_id = ?
     ORDER BY p.created_at DESC
     LIMIT 50`,
    [req.user.id, req.user.id, targetId]
  );

  const reposts = await query(
    `SELECT p.*, u.username, u.display_name, u.avatar_url,
            EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) AS liked,
            1 AS reposted,
            (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) AS like_count,
            (SELECT COUNT(*) FROM reposts WHERE post_id = p.id) AS repost_count,
            rp.created_at AS reposted_at
     FROM reposts rp
     JOIN posts p ON p.id = rp.post_id
     JOIN users u ON u.id = p.user_id
     WHERE rp.user_id = ? AND p.is_deleted = 0
     ORDER BY rp.created_at DESC
     LIMIT 50`,
    [req.user.id, targetId]
  );

  const combined = [...ownPosts, ...reposts];
  combined.sort((a, b) => {
    const aTime = a.reposted_at ? new Date(a.reposted_at).getTime() : new Date(a.created_at).getTime();
    const bTime = b.reposted_at ? new Date(b.reposted_at).getTime() : new Date(b.created_at).getTime();
    return bTime - aTime;
  });

  const ids = combined.map(r => r.id);
  const images = ids.length ? await query(`SELECT id, post_id, url FROM post_images WHERE is_deleted = 0 AND post_id IN (${ids.map(() => '?').join(',')})`, ids) : [];
  const postIdToImages = images.reduce((acc, img) => {
    acc[img.post_id] = acc[img.post_id] || [];
    acc[img.post_id].push({ id: img.id, url: img.url });
    return acc;
  }, {});

  res.json(combined.map(r => ({ ...r, images: postIdToImages[r.id] || [] })));
});

router.post('/', requireAuth, upload.array('images', 4), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Tweet text is required' });
    }
    const result = await query('INSERT INTO posts (user_id, content, is_deleted, created_at) VALUES (?, ?, 0, NOW())', [req.user.id, content || '']);
    const postId = result.insertId;
    for (const f of req.files || []) {
      await query('INSERT INTO post_images (post_id, url, is_deleted) VALUES (?, ?, 0)', [postId, `/uploads/${f.filename}`]);
    }
    res.status(201).json({ id: postId });
  } catch (err) {
    console.error('POST /api/posts error:', err);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post content (owner only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Tweet text is required' });
    }
    const owns = await query('SELECT 1 FROM posts WHERE id = ? AND user_id = ? AND is_deleted = 0', [postId, req.user.id]);
    if (!owns.length) return res.status(403).json({ error: 'Forbidden' });
    await query('UPDATE posts SET content = ? WHERE id = ?', [content, postId]);
    return res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/posts/:id error:', err);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Soft delete/restore post image
router.post('/:postId/images/:imageId/delete', requireAuth, async (req, res) => {
  const { postId, imageId } = req.params;
  // Only owner can modify
  const rows = await query('SELECT 1 FROM posts WHERE id = ? AND user_id = ?', [postId, req.user.id]);
  if (!rows.length) return res.status(403).json({ error: 'Forbidden' });
  await query('UPDATE post_images SET is_deleted = 1 WHERE id = ? AND post_id = ?', [imageId, postId]);
  res.json({ ok: true });
});

router.post('/:postId/images/:imageId/restore', requireAuth, async (req, res) => {
  const { postId, imageId } = req.params;
  const rows = await query('SELECT 1 FROM posts WHERE id = ? AND user_id = ?', [postId, req.user.id]);
  if (!rows.length) return res.status(403).json({ error: 'Forbidden' });
  await query('UPDATE post_images SET is_deleted = 0 WHERE id = ? AND post_id = ?', [imageId, postId]);
  res.json({ ok: true });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await query('UPDATE posts SET is_deleted = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

router.post('/:id/like', requireAuth, async (req, res) => {
  await query('INSERT IGNORE INTO post_likes (user_id, post_id, created_at) VALUES (?, ?, NOW())', [req.user.id, req.params.id]);
  res.json({ ok: true });
});

// Restore a soft-deleted post
router.post('/:id/restore', requireAuth, async (req, res) => {
  await query('UPDATE posts SET is_deleted = 0 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
  res.json({ ok: true });
});

router.delete('/:id/like', requireAuth, async (req, res) => {
  await query('DELETE FROM post_likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
  res.json({ ok: true });
});

// Repost (retweet)
router.post('/:id/repost', requireAuth, async (req, res) => {
  await query('INSERT IGNORE INTO reposts (user_id, post_id, created_at) VALUES (?, ?, NOW())', [req.user.id, req.params.id]);
  res.json({ ok: true });
});

router.delete('/:id/repost', requireAuth, async (req, res) => {
  await query('DELETE FROM reposts WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
  res.json({ ok: true });
});


