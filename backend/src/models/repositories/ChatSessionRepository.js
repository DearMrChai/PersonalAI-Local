// src/models/repositories/ChatSessionRepository.js
import db from '../connection.js';

/**
 * 聊天会话 数据访问层
 */
const ChatSessionRepository = {

  /**
   * 确保表结构是最新的
   */
  async ensureTable() {
    const createSql = `
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

    await new Promise((resolve, reject) => {
      db.run(createSql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ chat_sessions 表结构检查完成');
  },

  /**
   * 创建一个新的聊天会话
   */
  async create(characterId, userId = 0, title = '新对话') {
    await this.ensureTable();

    const sql = `
      INSERT INTO chat_sessions (user_id, character_id, title)
      VALUES (?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      db.run(sql, [userId, characterId, title], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, character_id: characterId, title });
      });
    });
  },

  /**
   * 获取某个角色的所有会话列表（按时间倒序）
   */
  async findByCharacterId(characterId) {
    await this.ensureTable();

    const sql = `
      SELECT * FROM chat_sessions 
      WHERE character_id = ? 
      ORDER BY updated_at DESC
    `;

    return new Promise((resolve, reject) => {
      db.all(sql, [characterId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * 获取单个会话
   */
  async findById(id) {
    await this.ensureTable();

    const sql = `SELECT * FROM chat_sessions WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  /**
   * 更新会话标题（可选）
   */
  async updateTitle(id, title) {
    await this.ensureTable();

    const sql = `UPDATE chat_sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [title, id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },
  /**
   * 删除某个会话（会级联删除其下的所有消息）
   */
  async delete(id) {
    await this.ensureTable();

    const sql = `DELETE FROM chat_sessions WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
};

export default ChatSessionRepository;