import axios from 'axios';

// process.env.VUE_APP_BASE_API

// 创建 axios 实例
const service = axios.create({
  baseURL:  'http://localhost:3000'|| '/api', // 接口基础路径（可通过环境变量配置）
  timeout: 5000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器：可添加 token 等请求头
service.interceptors.request.use(
  (config) => {
    // 示例：添加 token 到请求头（根据实际业务调整）
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误：', error);
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理响应结果、错误提示
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    // 示例：根据后端约定的状态码判断请求是否成功
    if (res.code !== 200) {
      // 可添加错误提示（如 ElementUI 的 Message）
      // ElMessage.error(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg || '请求失败'));
    } else {
      return res; // 成功则返回数据
    }
  },
  (error) => {
    console.error('响应错误：', error);
    // 统一错误提示
    // ElMessage.error(error.message || '服务器错误');
    return Promise.reject(error);
  }
);

export default service;