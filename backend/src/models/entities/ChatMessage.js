// src/models/entities/ChatMessage.js
import db from '../connection.js';

const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      role TEXT NOT NULL,                    -- 'user' 或 'assistant'
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    )
  `;

  db.run(sql, (err) => {
    if (err) console.error('创建 chat_messages 表失败:', err.message);
    else console.log('✅ chat_messages 表初始化完成');
  });
};

createTable();

export default { createTable };