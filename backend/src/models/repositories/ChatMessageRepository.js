// src/models/repositories/ChatMessageRepository.js
import db from '../connection.js';

/**
 * 聊天消息 数据访问层
 */
const ChatMessageRepository = {

  /**
   * 确保表结构是最新的
   */
  async ensureTable() {
    const createSql = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        role TEXT NOT NULL,           -- 'user' 或 'assistant'
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
      )
    `;

    await new Promise((resolve, reject) => {
      db.run(createSql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ chat_messages 表结构检查完成');
  },

  /**
   * 添加一条消息
   */
  async create(sessionId, role, content) {
    await this.ensureTable();

    const sql = `
      INSERT INTO chat_messages (session_id, role, content)
      VALUES (?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.run(sql, [sessionId, role, content], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, session_id: sessionId, role, content });
      });
    });
  },

 async findBySessionId(sessionId) {
    await this.ensureTable();

    const sql = `
      SELECT * FROM chat_messages 
      WHERE session_id = ? 
      ORDER BY created_at ASC
    `;

    return new Promise((resolve, reject) => {
      db.all(sql, [sessionId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * 获取某个会话的最近 N 条消息
   */
  async findRecentBySessionId(sessionId, limit = 20) {
    await this.ensureTable();

    const sql = `
      SELECT * FROM chat_messages 
      WHERE session_id = ? 
      ORDER BY created_at ASC 
      LIMIT ?
    `;

    return new Promise((resolve, reject) => {
      db.all(sql, [sessionId, limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },
  /**
   * 删除某条具体消息
   */
  async delete(messageId) {
    await this.ensureTable();

    const sql = `DELETE FROM chat_messages WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [messageId], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  /**
   * 清空某个会话的所有消息
   */
  async deleteBySessionId(sessionId) {
    await this.ensureTable();

    const sql = `DELETE FROM chat_messages WHERE session_id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [sessionId], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
  
};

export default ChatMessageRepository;