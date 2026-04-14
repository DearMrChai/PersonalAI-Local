/**
 * 接口返回值标准化工具类
 * 统一封装 {code, data, msg} 格式的返回结果，适配所有 Node.js 接口场景
 * 作者：自定义
 * 日期：2024-XX-XX
 */

/**
 * 核心方法：构建标准返回结构
 * @param {number} code 状态码（默认200）
 * @param {any} data 返回数据（默认null，支持任意类型：对象/数组/基本类型）
 * @param {string} msg 提示信息（默认"操作成功"）
 * @returns {object} 标准返回对象 {code, data, msg}
 */
function createResponse(code = 200, data = null, msg = "操作成功") {
  return {
    code,
    data,
    msg
  };
}

/**
 * 快捷方法：操作成功返回（默认code=200）
 * @param {any} data 要返回的业务数据（可选）
 * @param {string} msg 自定义成功提示语（可选，默认"操作成功"）
 * @returns {object} 标准成功返回结构
 */
createResponse.success = function (data = null, msg = "操作成功") {
  return this(200, data, msg);
};

/**
 * 快捷方法：客户端错误返回（默认code=400）
 * @param {string} msg 错误提示语（必填）
 * @param {number} code 自定义客户端状态码（可选，默认400）
 * @returns {object} 标准失败返回结构
 */
createResponse.clientError = function (msg, code = 400) {
  return this(code, null, msg);
};

/**
 * 快捷方法：未授权返回（固定code=401）
 * @param {string} msg 未授权提示语（可选，默认"未授权，请先登录"）
 * @returns {object} 标准未授权返回结构
 */
createResponse.unauthorized = function (msg = "未授权，请先登录") {
  return this(401, null, msg);
};

/**
 * 快捷方法：禁止访问返回（固定code=403）
 * @param {string} msg 禁止访问提示语（可选，默认"无权限访问该资源"）
 * @returns {object} 标准禁止访问返回结构
 */
createResponse.forbidden = function (msg = "无权限访问该资源") {
  return this(403, null, msg);
};

/**
 * 快捷方法：资源不存在返回（固定code=404）
 * @param {string} msg 资源不存在提示语（可选，默认"请求的资源不存在"）
 * @returns {object} 标准资源不存在返回结构
 */
createResponse.notFound = function (msg = "请求的资源不存在") {
  return this(404, null, msg);
};

/**
 * 快捷方法：服务端错误返回（默认code=500）
 * @param {string} msg 错误提示语（可选，默认"服务器内部错误"）
 * @param {number} code 自定义服务端状态码（可选，默认500）
 * @returns {object} 标准失败返回结构
 */
createResponse.serverError = function (msg = "服务器内部错误", code = 500) {
  return this(code, null, msg);
};

// 导出工具函数（支持ES6模块导入）
export default createResponse;