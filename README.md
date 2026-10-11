# AnEpoch 管理后台（anepoch-fe）

基于 **Vue 3 + Ant Design Vue** 的前端管理后台模板，内置登录鉴权、布局框架、工作台、用户/角色管理等常用模块，开箱即用。

---

## 一、技术栈

| 类别 | 技术 | 版本 | 说明 |
| --- | --- | --- | --- |
| 核心框架 | Vue | ^3.5 | Composition API + `<script setup>` |
| UI 组件库 | Ant Design Vue | ^4.2 | 全局注册，已配置中文 locale |
| 路由 | Vue Router | ^4.5 | History 模式 + 路由守卫 |
| 状态管理 | Pinia | ^2.3 | 组合式 store（setup 写法） |
| 构建工具 | Vite | ^6.0 | 开发热更新、生产构建 |
| 语言 | TypeScript | ~5.6 | 严格模式，`@` 别名指向 `src/` |
| HTTP 客户端 | axios | ^1.7 | 统一拦截器封装 |
| 日期处理 | dayjs | ^1.11 | Ant Design Vue 依赖，已配置中文 |
| CSS 预处理 | Less | ^4.2 | 组件内 scoped less |
| 图标 | @ant-design/icons-vue | ^7.0 | 菜单、按钮图标 |

---

## 二、功能特性

- **中台门户**：登录后先进入「中台选择」页，菱形卡片呈现 12+ 个中台入口（浅色清爽风格），点击进入子系统并记住上次使用；卡片数量可无限扩展，网格自适应
- **登录鉴权**：mock 登录、token 持久化（localStorage）、路由守卫自动重定向
- **整体布局**：深色可折叠侧边栏 + 面包屑 + 用户下拉菜单 + 页面切换动画
- **工作台**：统计卡片、近 7 日访问量柱状图（纯 CSS 实现，零图表依赖）、订单状态分布、最新订单表格
- **用户管理**：关键词/状态搜索、分页、新增/编辑弹窗（表单校验）、删除二次确认、状态开关
- **角色管理**：列表 + 增删改查弹窗
- **404 页面**：兜底路由，支持一键返回首页
- **Mock 数据层**：无后端即可完整运行，接口延迟模拟便于展示 loading

---

## 三、环境要求

- Node.js **>= 18**（开发使用 v22 验证）
- npm >= 9（或 pnpm / yarn 均可）

---

## 四、相关指令

```bash
# 安装依赖（仅首次）
npm install

# 启动开发服务器（默认端口 5180，strictPort 固定端口）
npm run dev
# 访问 http://localhost:5180/
# 局域网设备可访问 http://<本机IP>:5180/

# 生产构建（产物输出到 dist/）
npm run build

# 本地预览生产构建产物
npm run preview
```

> 本项目 `vite.config.ts` 中设置了 `strictPort: true`，若 5180 端口被占用会直接报错退出而不是自动换端口，需先释放端口或修改 `server.port`。

**演示账号**：`admin` / `123456`

---

## 五、目录结构（分包说明）

```
anepoch-fe/
├── public/
│   └── favicon.svg              # 站点图标
├── index.html                   # 单页应用入口 HTML
├── vite.config.ts               # Vite 配置：@ 别名、/api 代理
├── tsconfig.json                # TypeScript 配置
├── package.json
└── src/
    ├── main.ts                  # 应用入口：注册 Pinia / Router / Antd
    ├── App.vue                  # 根组件：a-config-provider 中文 locale
    ├── env.d.ts                 # 类型声明（.vue 模块、Vite 客户端类型）
    │
    ├── router/
    │   └── index.ts             # 路由表 + 全局守卫 + 页面标题
    │
    ├── stores/
    │   └── user.ts              # 登录态 store（token / userInfo / login / logout）
    │
    ├── utils/
    │   └── request.ts           # axios 实例：token 注入、401 跳登录、错误提示
    │
    ├── config/
    │   └── systems.ts            # ── 中台注册表（门户卡片 + 布局菜单的唯一数据源）──
    │
    ├── api/                     # ── 数据层（按中台分包，当前为 mock）──
    │   ├── common.ts            # 通用类型（分页）、模拟延迟工具
    │   ├── auth.ts              # 登录接口（mock：admin / 123456）
    │   ├── admin/               # 用户管理中台接口
    │   │   ├── user.ts          #   用户 CRUD
    │   │   ├── role.ts          #   角色 CRUD
    │   │   └── dashboard.ts     #   中台首页统计
    │   └── data/                # 数据中台接口
    │       └── overview.ts      #   数据概览
    │
    ├── layouts/
    │   └── BasicLayout.vue      # 主框架：侧边栏 / 头部 / 内容区 / 页脚
    │                            # 菜单来自 config/systems.ts 注册表
    │
    ├── views/                   # ── 页面层（按中台分包）──
    │   ├── login/Login.vue          # 登录页
    │   ├── portal/Portal.vue        # 中台选择门户页（登录后首站）
    │   ├── admin/                   # 用户管理中台
    │   │   ├── dashboard/index.vue  #   中台首页
    │   │   ├── users/index.vue      #   用户管理（完整 CRUD 示例）
    │   │   └── roles/index.vue      #   角色管理
    │   ├── data/                    # 数据中台
    │   │   └── overview/index.vue   #   数据概览
    │   └── error/NotFound.vue       # 404
    │
    └── styles/
        └── index.less           # 全局样式：高度铺满、滚动条、字体
```

### 路由结构

```
/login                 登录页
/portal                中台选择门户（登录后默认进入）
/admin                 用户管理中台（BasicLayout 布局）
  ├── /admin/dashboard 中台首页（原工作台）
  ├── /admin/users     用户管理
  └── /admin/roles     角色管理
/data                  数据中台（BasicLayout 布局）
  └── /data/overview   数据概览
/*                     404 兜底
```

### 分层约定

- **views 层**不直接操作数据，统一通过 `api/` 下的函数获取数据；
- **api 层**当前用内存数据模拟（`mockDelay` 模拟网络延迟），后续对接真实后端时，将函数体替换为 `request.get/post(...)` 即可，页面代码无需改动；
- **stores 层**只存放跨页面共享状态（目前是登录态），页面私有状态留在组件内；
- 新增业务页面：在 `views/<中台>/<模块>/` 建组件 → 在 `router/index.ts` 注册路由 → 如需入菜单，在 `config/systems.ts` 对应中台的 `menus` 下加一项；
- 新增中台卡片（建设中）：只需在 `config/systems.ts` 的 `SYSTEMS` 中加一条 `building` 记录，门户自动展示（自适应网格，任意数量卡片均不影响布局）；
- 新增中台系统（完整上线）：`config/systems.ts` 加记录并置为 `online` → `views/<key>/` 建页面、`api/<key>/` 建接口 → `router/index.ts` 增加路由分支。

---

## 六、对接真实后端

1. 修改 `vite.config.ts` 中的代理目标：

```ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',  // 改成你的后端地址
    changeOrigin: true,
  },
},
```

2. 将 `src/api/` 下各 mock 函数替换为真实请求，例如：

```ts
import request from '@/utils/request'

export function fetchUsers(params: UserQuery) {
  return request.get('/users', { params })
}
```

3. 若后端返回结构与页面不一致，只需在 api 层做一次转换，保持页面组件的入参/出参不变。

---

## 七、常用配置位置

| 需求 | 修改位置 |
| --- | --- |
| 修改端口 / 代理 | `vite.config.ts` → `server` |
| 新增菜单 / 页面 | `src/router/index.ts` + `src/config/systems.ts`（`menus`） |
| 新增中台卡片 / 中台系统 | `src/config/systems.ts`（`SYSTEMS` 注册表）+ `src/router/index.ts` + `src/views/<key>/` |
| 修改主题色 | `main.ts` 中为 ConfigProvider 增加 `:theme="{ token: { colorPrimary: '#1677ff' } }"` |
| 修改登录账号 | `src/api/auth.ts`（对接后端后无需修改） |
