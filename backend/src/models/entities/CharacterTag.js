import db from '../connection.js';

const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS character_tags (
      character_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (character_id, tag_id),
      FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )
  `;

  db.run(sql, (err) => {
    if (err) console.error('创建 character_tags 联表失败:', err.message);
    else console.log('✅ character_tags 联表初始化完成');
  });
};

createTable();

export default { createTable };