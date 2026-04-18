// src/schemas/tag.schema.js
import { z } from 'zod';

// 创建标签的 Schema
export const createTagSchema = z.object({
  name: z.string({
    required_error: "标签名称不能为空",
    invalid_type_error: "标签名称必须是字符串"
  })
    .min(1, "标签名称长度至少为1")
    .max(20, "标签名称长度不能超过20"),
  
  // type 是可选的，如果有值则必须是特定字符串之一
  type: z.enum(['general', 'character', 'scene']).optional().default('general')
});

// 获取标签列表的 Query Schema (示例)
export const getTagsQuerySchema = z.object({
  page: z.string().optional().transform((val) => val ? parseInt(val) : 1),
  limit: z.string().optional().transform((val) => val ? parseInt(val) : 10),
});