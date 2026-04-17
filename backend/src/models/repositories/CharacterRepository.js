
import db from '../connection.js';

/**
 * 角色数据访问层 (Repository)
 * 服务层应该通过这里来操作数据库，而不是直接操作 db
 */
const CharacterRepository = {

  /**
   * 创建角色
   */
  async create(characterData) {
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
   * 根据 ID 查询角色
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
   * 获取所有角色
   */
  async findAll() {
    const sql = `SELECT * FROM characters ORDER BY created_at DESC`;
    return new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  /**
   * 更新角色
   */
  async update(id, characterData) {
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

    console.log(params);

    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
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