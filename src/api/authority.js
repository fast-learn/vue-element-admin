import request from '@/utils/request'

// 用户管理

// 获取用户列表
export function getUserRoleList(query) {
  return request({
    url: '/role/getUserList',
    method: 'get',
    params: query
  })
}

export function getUserRole(query) {
  return request({
    url: '/role/getUserRole',
    method: 'get',
    params: query
  })
}
// 删除用户接口
export function deleteUser(query) {
  return request({
    url: '/role/deleteUser',
    method: 'get',
    params: query
  })
}

// 获取角色表的信息
export function getRoleList(query) {
  return request({
    url: '/role/getRoleList',
    method: 'get',
    params: query
  })
}

// 新增用户接口
export function addUserList(query) {
  return request({
    url: '/role/addUser',
    method: 'post',
    params: query
  })
}

// 编辑用户接口
export function updateUser(query) {
  return request({
    url: '/role/updateUser',
    method: 'post',
    params: query
  })
}

// 菜单管理

// 获取菜单列表
export function getMenuList(query) {
  return request({
    url: '/role/getMenuList',
    method: 'get',
    params: query
  })
}

// 删除菜单项
export function deleteMenu(query) {
  return request({
    url: '/role/deleteMenu',
    method: 'get',
    params: query
  })
}

// 新增菜单项
export function addMenu(query) {
  return request({
    url: '/role/addMenu',
    method: 'get',
    params: query
  })
}

// 编辑菜单项
export function updateMenu(query) {
  return request({
    url: '/role/updateMenu',
    method: 'post',
    params: query
  })
}

// 删除角色
export function deleteRole(query) {
  return request({
    url: '/role/deleteRole',
    method: 'get',
    params: query
  })
}

// 新增角色
export function addRole(query) {
  return request({
    url: '/role/addRole',
    method: 'post',
    params: query
  })
}

// 查询角色绑定的菜单
export function getMenuRole(query) {
  return request({
    url: '/role/getMenuRole',
    method: 'get',
    params: query
  })
}

// 更新角色
export function updataRole(query) {
  return request({
    url: '/role/updataRole',
    method: 'post',
    params: query
  })
}

export function getUserMenu(query) {
  return request({
    url: '/role/getUserMenu',
    method: 'get',
    params: query
  })
}
