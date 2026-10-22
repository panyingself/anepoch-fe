import { ref } from 'vue'
import { defineStore } from 'pinia'
import { login as loginApi } from '@/api/auth'
import type { LoginParams, UserInfo } from '@/api/auth'

const TOKEN_KEY = 'anepoch_token'
const USER_KEY = 'anepoch_user'

function loadStoredUser(): UserInfo | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY) || '')
  const userInfo = ref<UserInfo | null>(loadStoredUser())

  async function login(params: LoginParams) {
    const data = await loginApi(params)
    token.value = data.token
    userInfo.value = data.user
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  /** 直接设置 token（多登录方式共用的通用入口） */
  function setToken(t: string) {
    token.value = t
    localStorage.setItem(TOKEN_KEY, t)
  }

  /** 直接设置用户信息（多登录方式共用的通用入口） */
  function setUserInfo(u: UserInfo) {
    userInfo.value = u
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  return { token, userInfo, login, logout, setToken, setUserInfo }
})
