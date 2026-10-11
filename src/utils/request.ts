import axios from 'axios'
import { message } from 'ant-design-vue'

const TOKEN_KEY = 'anepoch_token'

/** axios 实例：对接真实后端时在 api 模块中使用，当前页面数据来自本地 mock */
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
      return Promise.reject(error)
    }
    const msg = error.response?.data?.message || error.message || '请求失败，请稍后重试'
    message.error(msg)
    return Promise.reject(error)
  },
)

export default request
