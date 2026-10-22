import axios from 'axios'

const TOKEN_KEY = 'anepoch_token'

/** 纯数字字符串 → number；否则原样返回 */
function tryToNumber(v: unknown): unknown {
  if (typeof v === 'string' && /^\d+$/.test(v)) {
    const n = Number(v)
    return Number.isSafeInteger(n) ? n : v
  }
  return v
}

/**
 * 后端 id 字段全是字符串（"1"、"2"），前端类型定义为 number，
 * 统一在拦截器里做归一化：递归遍历 JSON，把 id/xxxId/xxxIds 字段值从字符串转 number。
 */
function normalizeIds(node: unknown, key?: string): unknown {
  if (Array.isArray(node)) {
    return node.map((item, idx) => normalizeIds(item, typeof item === 'object' && item ? undefined : key))
  }
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = normalizeIds(v, k)
    }
    return out
  }
  // id 相关字段：id / xxxId / xxxIds（如 id, parentId, roleIds）
  // 两个分支都要匹配"结尾"：.*Id（单）和.*Ids（复数）
  if (key && /^(.*[Ii]d|.*[Ii]ds)$/.test(key)) {
    return tryToNumber(node)
  }
  return node
}

/**
 * axios 实例：对接 keeay-user 后端（http://localhost:8089/keeay-user）
 * baseURL 已含后端 context-path，业务模块只需写 /admin/** 等业务路径
 */
const request = axios.create({
  baseURL: '/keeay-user/api',
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
  (response) => {
    // 后端统一返回 { code, message, data, traceId } 包装体，解包 data 给业务层
    const body = response.data
    const payload =
      body && typeof body === 'object' && 'code' in body && 'data' in body ? body.data : body
    return normalizeIds(payload)
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }
    // 后端错误响应有两层形态：
    //   1) 旧格式：直接 { message }  + HTTP 400/500
    //   2) 新格式：{ code:200, message:"success", data:{ message:"系统繁忙..." } } + HTTP 500
    const errBody = error.response?.data
    const msg =
      errBody?.data?.message ||
      errBody?.message ||
      error.message ||
      '请求失败，请稍后重试'
    return Promise.reject(new Error(msg))
  },
)

/* ====== 类型化封装：响应拦截器已解包为业务数据 ====== */
export function get<T>(url: string, config?: Parameters<typeof request.get>[1]): Promise<T> {
  return request.get(url, config) as unknown as Promise<T>
}

export function post<T>(url: string, data?: unknown, config?: Parameters<typeof request.post>[2]): Promise<T> {
  return request.post(url, data, config) as unknown as Promise<T>
}

export function put<T>(url: string, data?: unknown, config?: Parameters<typeof request.put>[2]): Promise<T> {
  return request.put(url, data, config) as unknown as Promise<T>
}

export function del<T>(url: string, config?: Parameters<typeof request.delete>[1]): Promise<T> {
  return request.delete(url, config) as unknown as Promise<T>
}

export default request
