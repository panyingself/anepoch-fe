/** 通用分页响应结构 */
export interface PageResult<T> {
  list: T[]
  total: number
}

export interface PageQuery {
  page: number
  pageSize: number
}

/** 模拟网络延迟，便于展示 loading 效果 */
export function mockDelay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
