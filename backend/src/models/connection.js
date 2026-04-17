import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 建议把数据库文件放在项目根目录的 database 文件夹里
const dbPath = path.resolve(__dirname, '../../../database/personal_ai.db');
console.log(`🔍 正在连接SQLite数据库，路径：${dbPath}`);
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite 连接失败:', err.message);
  } else {
    console.log('✅ SQLite 数据库连接成功 →', dbPath);
  }
});

export default db;