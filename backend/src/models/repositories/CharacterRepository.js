// CharacterRepository
import db from '../connection.js';
import CharacterTagRepository from './CharacterTagRepository.js';   // ← 必须引入

/**
 * 角色数据访问层 (Repository)
 * 服务层应该只调用这里的方法，不直接操作 db
 */
const CharacterRepository = {

  /**
   * 确保表结构是最新的（自动升级字段）
   * 以后新增字段只需要在这里加 ALTER TABLE 逻辑
   */
  async ensureTable() {
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
      )
    `;

    await new Promise((resolve, reject) => {
      db.run(createSql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('✅ characters 表结构检查完成');
  },

  /**
   * 创建角色
   */
  async create(characterData) {
    await this.ensureTable();   // 确保表结构最新

    const sql = `
      INSERT INTO characters (
        name, avatar, short_bio, personality, tone, opening,
        description, background_story, relationship, age,
        height, body_type, appearance, likes, dislikes, habits,
        sexual_personality, tags, kinks, voice_style,
        example_dialogs, memory_template, visual_style
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      characterData.name,
      characterData.avatar || '',
      characterData.short_bio || '',
      characterData.personality || '',
      characterData.tone || '',
      characterData.opening || '',
      characterData.description || '',
      characterData.background_story || '',
      characterData.relationship || '',
      characterData.age || '',
      characterData.height || '',
      characterData.body_type || '',
      characterData.appearance || '',
      characterData.likes || '',
      characterData.dislikes || '',
      characterData.habits || '',
      characterData.sexual_personality || '',
      JSON.stringify(characterData.tags || []),
      JSON.stringify(characterData.kinks || []),
      characterData.voice_style || '',
      JSON.stringify(characterData.example_dialogs || []),
      characterData.memory_template || '',
      characterData.visual_style || ''
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, ...characterData });
      });
    });
  },

  /**
   * 根据 ID 查询角色（基础版）
   */
  async findById(id) {
    const sql = `SELECT * FROM characters WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.get(sql, [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  /**
   * 根据 ID 查询角色（带标签）
   */
  async findByIdWithTags(id) {
    const character = await this.findById(id);
    if (!character) return null;

    // 查询该角色关联的标签
    const tags = await CharacterTagRepository.getTagsByCharacterId(id);

    return {
      ...character,
      tags: tags || []
    };
  },

  /**
   * 获取所有角色
   */
  async findAll() {
    const sql = `SELECT * FROM characters ORDER BY created_at DESC`;
    const rows = await new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    // 可以选择在这里解析 JSON 字段，也可以留在 service 层做
    return rows.map(item => ({
      ...item,
      tags: JSON.parse(item.tags || '[]'),
      kinks: JSON.parse(item.kinks || '[]'),
      example_dialogs: JSON.parse(item.example_dialogs || '[]')
    }));
  },

  /**
   * 更新角色
   */
  async update(id, characterData) {
    await this.ensureTable();

    const sql = `
      UPDATE characters SET
        name = ?, avatar = ?, short_bio = ?, personality = ?,
        tone = ?, opening = ?, description = ?, background_story = ?,
        relationship = ?, age = ?, height = ?, body_type = ?,
        appearance = ?, likes = ?, dislikes = ?, habits = ?,
        sexual_personality = ?, tags = ?, kinks = ?, voice_style = ?,
        example_dialogs = ?, memory_template = ?, visual_style = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      characterData.name, characterData.avatar, characterData.short_bio,
      characterData.personality, characterData.tone, characterData.opening,
      characterData.description, characterData.background_story,
      characterData.relationship, characterData.age, characterData.height,
      characterData.body_type, characterData.appearance, characterData.likes,
      characterData.dislikes, characterData.habits, characterData.sexual_personality,
      JSON.stringify(characterData.tags || []), JSON.stringify(characterData.kinks || []),
      characterData.voice_style, JSON.stringify(characterData.example_dialogs || []),
      characterData.memory_template, characterData.visual_style, id
    ];

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes, id });
      });
    });
  },

  /**
   * 删除角色
   */
  async delete(id) {
    const sql = `DELETE FROM characters WHERE id = ?`;
    return new Promise((resolve, reject) => {
      db.run(sql, [id], function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  }
};

export default CharacterRepository;