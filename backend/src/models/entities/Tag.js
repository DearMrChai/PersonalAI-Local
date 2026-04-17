import db from '../connection.js';

const createTable = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,           -- 标签名称，如 "温柔"、"黑长直"
      type TEXT DEFAULT 'general',         -- general / kink / personality
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.run(sql, (err) => {
    if (err) console.error('创建 tags 表失败:', err.message);
    else console.log('✅ tags 表初始化完成');
  });
};

createTable();

export default { createTable };