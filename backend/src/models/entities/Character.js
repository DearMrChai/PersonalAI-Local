import db from '../connection.js';

const createTable = () => {
  const sql = `
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
      tags TEXT DEFAULT '[]',           -- JSON 字符串
      kinks TEXT DEFAULT '[]',
      voice_style TEXT DEFAULT '',
      example_dialogs TEXT DEFAULT '[]',
      memory_template TEXT DEFAULT '',
      visual_style TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(sql, (err) => {
    if (err) console.error('创建 characters 表失败:', err.message);
    else console.log('✅ characters 表初始化完成');
  });
};

createTable();

export default { createTable };