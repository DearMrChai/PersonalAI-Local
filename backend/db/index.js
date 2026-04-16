import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.db');

// 正确写法！！！
const sqlite = sqlite3.verbose();
const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite 连接失败', err.message);
  } else {
    console.log('✅ SQLite 连接成功');
    initTable();
  }
});

// 初始化表
function initTable() {
    //   id            编号（主键，自增）
// name          角色名称
// avatar        头像URL
// short_bio     短简介
// personality   核心性格
// tone          说话语气
// opening       开场白

// description   详细描述
// background_story 背景故事
// relationship  与用户关系
// age           年龄
// height        身高
// body_type     体型
// appearance    外貌
// likes         喜好
// dislikes      厌恶
// habits        习惯
// sexual_personality 性性格

// tags          标签（JSON数组）
// kinks         特殊癖好
// voice_style   语音风格
// example_dialogs 对话示例（JSON）
// memory_template 记忆模板
// visual_style  视觉风格

// user_id       预留用户ID（以后多用户直接用）
// created_at    创建时间
// updated_at    更新时间
  const createSql = `
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER DEFAULT 0,
    name TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    short_bio TEXT DEFAULT '',
    personality TEXT DEFAULT '',
    tone TEXT DEFAULT '',
    opening TEXT DEFAULT '',
    description TEXT DEFAULT '',
    background_story TEXT DEFAULT '',
    relationship TEXT DEFAULT '',
    age TEXT DEFAULT '',
    height TEXT DEFAULT '',
    body_type TEXT DEFAULT '',
    appearance TEXT DEFAULT '',
    likes TEXT DEFAULT '',
    dislikes TEXT DEFAULT '',
    habits TEXT DEFAULT '',
    sexual_personality TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    kinks TEXT DEFAULT '[]',
    voice_style TEXT DEFAULT '',
    example_dialogs TEXT DEFAULT '[]',
    memory_template TEXT DEFAULT '',
    visual_style TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`;
  db.run(createSql);
}

// 正确命名导出（你路由里直接用 import { run, all, get }）
export const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

export const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

export const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

export { db };