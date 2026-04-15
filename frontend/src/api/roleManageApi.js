import request from './request'; // 引入之前封装的axios实例

export const getRoles = () => {
  return request({
    url: '/api/roles',
    method: 'get'
  });
};

export const saveRoles = (data) => {
  return request({
    url: '/api/saveRoles',
    method: 'post',
    data: data
  });
};

export const deleteRoles = (name) => {
    return request({
        url: '/api/delRoles',
        method: 'post',
        data: { name }
    });
}

