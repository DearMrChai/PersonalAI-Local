// src/models/entities/ChatSession.js
import db from '../connection.js';

const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER DEFAULT 0,
      character_id INTEGER NOT NULL,
      title TEXT DEFAULT '新对话',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
    )
  `;

  db.run(sql, (err) => {
    if (err) console.error('创建 chat_sessions 表失败:', err.message);
    else console.log('✅ chat_sessions 表初始化完成');
  });
};

createTable();

export default { createTable };