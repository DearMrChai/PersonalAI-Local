import db from './connection.js';
import Character from './entities/Character.js';
import Tag from './entities/Tag.js';
import CharacterTag from './entities/CharacterTag.js';

// 以后新增表就在这里引入并导出
// import Session from './entities/Session.js';

export {
  db,           // 原始 db 对象（必要时直接用）
  Character,
  Tag,
  CharacterTag,
  // Session,
};