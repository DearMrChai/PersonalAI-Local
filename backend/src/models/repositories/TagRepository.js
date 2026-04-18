import db from '../connection.js';

/**
 * 标签数据访问层 (Repository)
 * 服务层应该通过这里来操作标签表
 */
const TagRepository = {

  /**
   * 确保表结构是最新的（自动升级字段）
   */
  async ensureTable() {
    const createSql = `
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        type TEXT DEFAULT 'general',         -- general / kink / personality
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await new Promise((resolve, reject) => {
      db.run(createSql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ tags 表结构检查完成');
  },

  /**
   * 创建标签（如果已存在则返回已有标签）
   */
  async createOrGet(name, type = 'general') {
    await this.ensureTable();   // 确保表结构最新

    if (!name || typeof name !== 'string') {
      throw new Error('标签名称不能为空');
    }

    console.log("TagRepository.createOrGet", name, type);

    // 先查询是否已存在
    const selectSql = `SELECT * FROM tags WHERE name = ?`;
    const existing = await new Promise((resolve, reject) => {
      db.get(selectSql, [name.trim()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existing) return existing;

    // 不存在则创建
    const insertSql = `INSERT INTO tags (name, type) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
      db.run(insertSql, [name.trim(), type], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name: name.trim(), type });
      });
    });
  },

  /**
   * 获取所有标签
   */
  async findAll() {
    await this.ensureTable();

    const sql = `SELECT * FROM tags ORDER BY name`;
    return new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * 根据 ID 查询单个标签
   */
  async findById(id) {
    await this.ensureTable();

    const sql = `SELECT * FROM tags WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  /**
   * 更新标签（主要更新 type）
   */
  async update(id, data) {
    await this.ensureTable();

    const sql = `
      UPDATE tags 
      SET name = ?, type = ?
      WHERE id = ?
    `;

    return new Promise((resolve, reject) => {
      db.run(sql, [data.name, data.type, id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  /**
   * 删除标签
   * 注意：删除标签时会自动删除关联的 character_tags（因为有 ON DELETE CASCADE）
   */
  async delete(id) {
    await this.ensureTable();

    const sql = `DELETE FROM tags WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
};

export default TagRepository;