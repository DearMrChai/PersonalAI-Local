// src/middleware/validate.js
import { z } from 'zod';

/**
 * 验证中间件工厂
 * @param {z.ZodSchema} schema - Zod 定义的结构模式
 * @param {'body' | 'query' | 'params'} source - 数据来源，默认为 body
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // 根据来源获取待验证的数据
      let dataToValidate;
      if (source === 'body') {
        dataToValidate = req.body;
      } else if (source === 'query') {
        dataToValidate = req.query;
      } else if (source === 'params') {
        dataToValidate = req.params;
      }

      // 执行校验
      // safeParse 不会抛出异常，而是返回 { success: boolean, data?, error? }
      const result = schema.safeParse(dataToValidate);

      if (!result.success) {
        // 校验失败，提取错误信息
        const errors = result.error.errors.map((err) => ({
          field: err.path.join('.'), // 支持嵌套字段，如 user.name
          message: err.message,
        }));
        
        return res.status(400).json({
          message: '参数校验失败',
          errors,
        });
      }

      // 校验成功，可以将清洗后的数据赋值回 req，防止原始数据包含多余字段
      // 注意：如果你希望 Controller 拿到的是经过 Zod 转换类型后的数据（比如字符串转数字），这一步很有用
      if (source === 'body') {
        req.body = result.data;
      } else if (source === 'query') {
        req.query = result.data;
      } else if (source === 'params') {
        req.params = result.data;
      }

      next();
    } catch (error) {
      // 捕获意外的代码错误
      next(error);
    }
  };
};