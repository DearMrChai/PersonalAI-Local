import db from '../connection.js';

/**
 * 角色 - 标签 联表 数据访问层
 * 服务层应该通过这里来操作角色与标签的关联关系
 */
const CharacterTagRepository = {

  /**
   * 确保联表结构是最新的（自动升级）
   */
  async ensureTable() {
    const createSql = `
      CREATE TABLE IF NOT EXISTS character_tags (
        character_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (character_id, tag_id),
        FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `;

    await new Promise((resolve, reject) => {
      db.run(createSql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ character_tags 联表结构检查完成');
  },

  /**
   * 给角色添加一个或多个标签（支持幂等）
   */
  async addTags(characterId, tagIds) {
    await this.ensureTable();

    if (!characterId) throw new Error('角色ID不能为空');
    if (!tagIds || tagIds.length === 0) {
      return { success: true, message: '没有标签需要添加' };
    }

    // 如果传入的是单个数字，转成数组
    if (!Array.isArray(tagIds)) tagIds = [tagIds];

    const sql = `INSERT INTO character_tags (character_id, tag_id) VALUES (?, ?)`;

    const promises = tagIds.map(tagId => 
      new Promise((resolve, reject) => {
        db.run(sql, [characterId, tagId], (err) => {
          if (err) {
            // 如果是重复关联（UNIQUE约束），视为成功（幂等）
            if (err.message.includes('UNIQUE constraint failed')) {
              resolve();
            } else {
              reject(err);
            }
          } else {
            resolve();
          }
        });
      })
    );

    await Promise.all(promises);
    return { 
      success: true, 
      message: `已为角色 ${characterId} 添加 ${tagIds.length} 个标签` 
    };
  },

  /**
   * 获取角色拥有的所有标签
   */
  async getTagsByCharacterId(characterId) {
    await this.ensureTable();

    if (!characterId) throw new Error('角色ID不能为空');

    const sql = `
      SELECT t.* FROM tags t
      INNER JOIN character_tags ct ON t.id = ct.tag_id
      WHERE ct.character_id = ?
      ORDER BY t.name
    `;

    return new Promise((resolve, reject) => {
      db.all(sql, [characterId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  },

  /**
   * 删除角色与某个标签的关联
   */
  async removeTag(characterId, tagId) {
    await this.ensureTable();

    if (!characterId || !tagId) throw new Error('角色ID和标签ID不能为空');

    const sql = `DELETE FROM character_tags WHERE character_id = ? AND tag_id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [characterId, tagId], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  /**
   * 清空角色所有标签关联（可选使用）
   */
  async removeAllTags(characterId) {
    await this.ensureTable();

    if (!characterId) throw new Error('角色ID不能为空');

    const sql = `DELETE FROM character_tags WHERE character_id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [characterId], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
};

export default CharacterTagRepository;