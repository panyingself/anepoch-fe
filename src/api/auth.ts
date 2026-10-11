import { mockDelay } from './common'

export interface LoginParams {
  username: string
  password: string
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  roles: string[]
}

export interface LoginResult {
  token: string
  user: UserInfo
}

/** mock 登录：账号 admin / 123456 */
export async function login(params: LoginParams): Promise<LoginResult> {
  await mockDelay(500)
  if (params.username === 'admin' && params.password === '123456') {
    return {
      token: `mock-token-${Date.now()}`,
      user: {
        id: 1,
        username: 'admin',
        nickname: '超级管理员',
        roles: ['admin'],
      },
    }
  }
  throw new Error('用户名或密码错误')
}
