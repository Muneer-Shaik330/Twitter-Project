import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || ''
  });

  const dbName = process.env.DB_NAME || 'twitlite';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${dbName}\``);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(100) NOT NULL,
      bio TEXT,
      avatar_url VARCHAR(255),
      cover_url VARCHAR(255),
      created_at DATETIME NOT NULL
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      content TEXT,
      is_deleted TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS post_images (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      url VARCHAR(255) NOT NULL,
      is_deleted TINYINT(1) NOT NULL DEFAULT 0,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);
  // in case upgrading from older schema (MySQL lacks IF NOT EXISTS for columns)
  const [cols] = await connection.query("SHOW COLUMNS FROM post_images LIKE 'is_deleted'");
  if (!Array.isArray(cols) || cols.length === 0) {
    await connection.query('ALTER TABLE post_images ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0');
  }

  await connection.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      post_id INT NOT NULL,
      user_id INT NOT NULL,
      parent_id INT NULL,
      content TEXT,
      is_deleted TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS post_likes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      post_id INT NOT NULL,
      created_at DATETIME NOT NULL,
      UNIQUE KEY unique_like (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS reposts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      post_id INT NOT NULL,
      created_at DATETIME NOT NULL,
      UNIQUE KEY unique_repost (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS follows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      follower_id INT NOT NULL,
      following_id INT NOT NULL,
      created_at DATETIME NOT NULL,
      UNIQUE KEY unique_follow (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  await connection.end();
  console.log('Database initialized');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


