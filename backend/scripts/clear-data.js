import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

async function purgeUploads() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) return;
  const entries = fs.readdirSync(uploadsDir);
  for (const entry of entries) {
    const full = path.join(uploadsDir, entry);
    try {
      const stat = fs.statSync(full);
      if (stat.isFile()) fs.unlinkSync(full);
    } catch {}
  }
}

async function purgeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'twitlite'
  });

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    // Order doesn't matter with FK checks disabled, but we keep a sensible order
    const tables = [
      'post_likes',
      'reposts',
      'comments',
      'post_images',
      'follows',
      'posts',
      'users'
    ];
    for (const t of tables) {
      await connection.query(`TRUNCATE TABLE \`${t}\``);
    }
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.end();
  }
}

async function main() {
  await purgeDatabase();
  await purgeUploads();
  console.log('All data cleared: tables truncated and uploads removed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


