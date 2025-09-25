import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import { router as authRouter } from './routes/auth.js';
import { router as userRouter } from './routes/users.js';
import { router as postsRouter } from './routes/posts.js';
import { router as commentsRouter } from './routes/comments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
// Allow images to be embedded cross-origin (frontend runs on a different port)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postsRouter);
app.use('/api/comments', commentsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});


