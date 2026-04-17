import db from '../connection.js';

/**
 * 标签数据访问层
 */
const TagRepository = {

  /**
   * 创建标签（如果已存在则返回已有标签）
   */
  async createOrGet(name, type = 'general') {
    // 先查询是否已存在
    const selectSql = `SELECT * FROM tags WHERE name = ?`;
    const existing = await new Promise((resolve, reject) => {
      db.get(selectSql, [name], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existing) return existing;

    // 不存在则创建
    const insertSql = `INSERT INTO tags (name, type) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
      db.run(insertSql, [name, type], function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, name, type });
      });
    });
  },

  /**
   * 获取所有标签
   */
  async findAll() {
    const sql = `SELECT * FROM tags ORDER BY name`;
    return new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};

export default TagRepository;