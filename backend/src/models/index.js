import db from './connection.js';
import Character from './entities/Character.js';
import Tag from './entities/Tag.js';
import CharacterTag from './entities/CharacterTag.js';

import CharacterRepository from './repositories/CharacterRepository.js';
import TagRepository from './repositories/TagRepository.js';

export {
  db,
  Character,
  Tag,
  CharacterTag,
  CharacterRepository,
  TagRepository,
};