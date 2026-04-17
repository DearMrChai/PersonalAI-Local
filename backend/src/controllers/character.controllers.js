import createResponse from '../utils/responseUtil.js'
// 导入service层方法
import {
  getAllCharacters,
  getCharacterDetail,
  createCharacter,
  updateCharacter,
  deleteCharacter
} from '../services/character.service.js';


export const getAllCharactersController = async (req, res) => {
  try {
    const characters = await getAllCharacters();
    res.json(createResponse.success(characters, '获取角色列表成功'));
  } catch (error) {
    res.json(createResponse.error(error.message));
  }
};
export const getCharacterDetailController = async (req, res) => {
  try {
    const character = await getCharacterDetail(req.params.id);
    res.json(createResponse(character));
  } catch (error) {
    res.status(500).json(createResponse(null, error.message));
  }
};
export const createCharacterController = async (req, res) => { 
  try {
    const character = await createCharacter(req.body);
    res.json(createResponse(character));
  } catch (error) {
    res.status(500).json(createResponse(null, error.message));
  }
};
export const updateCharacterController = async (req, res) => {
  try {
    const character = await updateCharacter(req.body);
    res.json(createResponse(character));
  } catch (error) {
    res.status(500).json(createResponse(null, error.message));
  }
};
export const deleteCharacterController = async (req, res) => {
  try {
    const character = await deleteCharacter(req.params.id);
    res.json(createResponse(character));
  } catch (error) {
    res.status(500).json(createResponse(null, error.message));
  }
};