// src/models/migrate.js
import db from './connection.js';

// 定义迁移列表：键是版本号，值是执行的 SQL
const migrations = [
  {
    version: 1,
    up: () => {
      // 初始建表逻辑可以放在这里，或者由 entities 处理
      // 这里主要处理后续的变更
    }
  },
  {
    version: 2,
    up: (db) => {
      // 比如：给 tags 表添加 type 字段
      return new Promise((resolve, reject) => {
        db.run(`ALTER TABLE tags ADD COLUMN type TEXT DEFAULT 'general'`, (err) => {
          if (err) {
            // 如果报错说字段已存在，视为成功（幂等性）
            if (err.message.includes('duplicate column name')) {
              console.log('⚠️ 迁移 v2 跳过: 字段已存在');
              resolve();
            } else {
              reject(err);
            }
          } else {
            console.log('✅ 迁移 v2 成功: 添加 tags.type 字段');
            resolve();
          }
        });
      });
    }
  },
  {
    version: 3,
    up: (db) => {
      // 未来给 characters 加字段
      return new Promise((resolve, reject) => {
        db.run(`ALTER TABLE characters ADD COLUMN age INTEGER`, (err) => {
           if (err && !err.message.includes('duplicate column')) reject(err);
           else resolve();
        });
      });
    }
  }
];

export async function runMigrations() {
  return new Promise((resolve, reject) => {
    // 1. 确保迁移记录表存在
    db.run(`CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY)`, (err) => {
      if (err) return reject(err);

      // 2. 获取当前最新版本号
      db.get(`SELECT MAX(version) as maxVer FROM _migrations`, async (err, row) => {
        if (err) return reject(err);
        
        const currentVersion = row?.maxVer || 0;
        console.log(`📦 当前数据库版本: ${currentVersion}, 最新代码版本: ${migrations.length}`);

        // 3. 依次执行未运行的迁移
        try {
          for (const migration of migrations) {
            if (migration.version > currentVersion) {
              console.log(`🚀 正在执行迁移 v${migration.version}...`);
              await migration.up(db);
              
              // 记录版本
              await new Promise((res, rej) => {
                db.run(`INSERT INTO _migrations (version) VALUES (?)`, [migration.version], (err) => {
                  if (err) rej(err);
                  else res();
                });
              });
            }
          }
          console.log('✅ 所有迁移已完成');
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  });
}