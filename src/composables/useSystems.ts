import { ref } from 'vue'
import { getUserMenus, type MenuNode } from '@/api/auth'
import { buildSystems, type SystemMeta } from '@/config/systems'

/** 模块级缓存 + 懒加载：整个前端生命周期只 fetch 一次 */
const systemsCache = ref<SystemMeta[]>([])
const loaded = ref(false)
let loadingPromise: Promise<SystemMeta[]> | null = null

/** 将后端 MenuNode 适配成 buildSystems 需要的 ResourceNode 形状 */
function toResourceNode(n: MenuNode): any {
  return {
    id: n.id,
    parentId: n.parentId,
    type: n.type,
    name: n.name,
    code: n.code,
    path: n.path,
    sort: n.sort,
    status: n.status,
    createdAt: n.createdAt,
    children: n.children ? n.children.map(toResourceNode) : undefined,
  }
}

export function useSystems() {
  async function ensureLoaded(): Promise<SystemMeta[]> {
    if (loaded.value) return systemsCache.value
    if (loadingPromise) return loadingPromise
    loadingPromise = getUserMenus()
      .then((tree) => {
        // getUserMenus 返回的 MenuNode 适配成 ResourceNode 形状复用 buildSystems
        const adapted = tree.map(toResourceNode)
        systemsCache.value = buildSystems(adapted)
        loaded.value = true
        return systemsCache.value
      })
      .catch(() => {
        // 后端异常时返回空列表，不让 UI 崩
        systemsCache.value = []
        loaded.value = true
        return systemsCache.value
      })
      .finally(() => {
        loadingPromise = null
      })
    return loadingPromise
  }

  /** 根据 routeKey 查中台 */
  function getSystem(routeKey: string): SystemMeta | undefined {
    return systemsCache.value.find((s) => s.routeKey === routeKey)
  }

  /** 登出或切换用户时清空缓存，下次 ensureLoaded 会重新拉取 */
  function resetCache() {
    systemsCache.value = []
    loaded.value = false
    loadingPromise = null
  }

  return { systems: systemsCache, loaded, ensureLoaded, getSystem, resetCache }
}
