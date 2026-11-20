import { theme as antdTheme } from 'ant-design-vue'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'

export type ThemeId = 'starry' | 'nebula' | 'bubble' | 'basic' | 'ink' | 'emerald'

export interface ThemeMeta {
  id: ThemeId
  name: string
  swatch: string
  /** antd 全局主题 token */
  antd: ThemeConfig
  /** 布局与页面层 CSS 变量（App.vue 根节点注入） */
  vars: Record<string, string>
}

export const THEMES: Record<ThemeId, ThemeMeta> = {
  /** 星空主题：深空蓝 + 蓝青霓虹（与门户/登录页同源） */
  starry: {
    id: 'starry',
    name: '星空',
    swatch: 'linear-gradient(135deg, #4d9fff, #22d3ee)',
    antd: {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorPrimary: '#4d9fff',
        colorInfo: '#4d9fff',
        colorLink: '#6fb6ff',
        colorBgBase: '#0d1226',
        colorBgLayout: '#0a0f22',
        colorBgContainer: '#111a36',
        colorBgElevated: '#162046',
        colorBorder: 'rgba(120, 160, 255, 0.22)',
        colorBorderSecondary: 'rgba(120, 160, 255, 0.14)',
        borderRadius: 10,
      },
      components: {
        Table: {
          headerBg: 'rgba(90, 130, 255, 0.09)',
          headerColor: 'rgba(200, 220, 255, 0.75)',
          rowHoverBg: 'rgba(90, 140, 255, 0.09)',
        },
        Menu: {
          itemColor: 'rgba(206, 220, 255, 0.68)',
          itemHoverBg: 'rgba(90, 140, 255, 0.1)',
          itemSelectedBg: 'rgba(77, 159, 255, 0.16)',
          itemSelectedColor: '#7cc4ff',
          itemHeight: 42,
        },
        Card: {
          colorBorderSecondary: 'rgba(110, 150, 255, 0.16)',
        },
        Button: {
          primaryShadow: '0 6px 18px -6px rgba(77, 159, 255, 0.55)',
        },
      },
    },
    vars: {
      '--sider-bg': '#0c1330',
      '--header-bg': 'rgba(12, 19, 48, 0.85)',
      '--line': 'rgba(110, 150, 255, 0.16)',
      '--logo-text': '#e2ecff',
      '--logo-icon': '#4d9fff',
      '--icon-color': 'rgba(206, 220, 255, 0.65)',
      '--icon-hover': '#4d9fff',
      '--hover-bg': 'rgba(120, 160, 255, 0.1)',
      '--user-text': 'rgba(226, 236, 255, 0.88)',
      '--footer-text': 'rgba(180, 200, 255, 0.4)',
      '--text-main': 'rgba(230, 240, 255, 0.92)',
      '--text-sub': 'rgba(180, 200, 255, 0.55)',
      '--up-text': '#5eea9d',
      '--up-bg': 'rgba(82, 196, 90, 0.14)',
      '--down-text': '#ff7d85',
      '--down-bg': 'rgba(255, 77, 90, 0.14)',
      '--accent-bg': 'rgba(77, 159, 255, 0.12)',
      '--accent-border': 'rgba(77, 159, 255, 0.35)',
      '--banner-bg':
        'radial-gradient(1100px 300px at 18% 0%, rgba(77, 159, 255, 0.2), transparent 60%), radial-gradient(900px 260px at 78% 12%, rgba(34, 211, 238, 0.14), transparent 60%), linear-gradient(135deg, #0d1533 0%, #0a0f22 100%)',
      '--grid-line': 'rgba(110, 150, 255, 0.1)',
      '--bar-fill': 'linear-gradient(180deg, #4d9fff 0%, #22d3ee 100%)',
      '--bar-fill-hover': 'linear-gradient(180deg, #6fb6ff 0%, #3ee0f5 100%)',
    },
  },

  /** 炫彩星空主题：紫粉极光深空 */
  nebula: {
    id: 'nebula',
    name: '炫彩星空',
    swatch: 'linear-gradient(135deg, #4fd6ff, #a78bfa, #ff8fe0)',
    antd: {
      algorithm: antdTheme.darkAlgorithm,
      token: {
        colorPrimary: '#4fd6ff',
        colorInfo: '#4fd6ff',
        colorLink: '#8ee9ff',
        colorBgBase: '#0b1830',
        colorBgLayout: '#071227',
        colorBgContainer: '#111f3b',
        colorBgElevated: '#16264a',
        colorBorder: 'rgba(120, 210, 255, 0.22)',
        colorBorderSecondary: 'rgba(120, 210, 255, 0.14)',
        borderRadius: 10,
      },
      components: {
        Table: {
          headerBg: 'rgba(79, 214, 255, 0.1)',
          headerColor: 'rgba(200, 240, 255, 0.78)',
          rowHoverBg: 'rgba(79, 214, 255, 0.09)',
        },
        Menu: {
          itemColor: 'rgba(200, 230, 255, 0.7)',
          itemHoverBg: 'rgba(79, 214, 255, 0.1)',
          itemSelectedBg: 'rgba(79, 214, 255, 0.16)',
          itemSelectedColor: '#8ee9ff',
          itemHeight: 42,
        },
        Card: {
          colorBorderSecondary: 'rgba(120, 200, 255, 0.16)',
        },
        Button: {
          primaryShadow: '0 6px 18px -6px rgba(79, 214, 255, 0.55)',
        },
      },
    },
    vars: {
      '--sider-bg': '#0a1730',
      '--header-bg': 'rgba(10, 23, 48, 0.85)',
      '--line': 'rgba(110, 200, 255, 0.16)',
      '--logo-text': '#e8f6ff',
      '--logo-icon': '#4fd6ff',
      '--icon-color': 'rgba(196, 228, 255, 0.65)',
      '--icon-hover': '#4fd6ff',
      '--hover-bg': 'rgba(79, 214, 255, 0.1)',
      '--user-text': 'rgba(230, 245, 255, 0.9)',
      '--footer-text': 'rgba(170, 210, 255, 0.42)',
      '--text-main': 'rgba(232, 246, 255, 0.94)',
      '--text-sub': 'rgba(180, 214, 255, 0.58)',
      '--up-text': '#5ef2c0',
      '--up-bg': 'rgba(94, 242, 192, 0.14)',
      '--down-text': '#ff8fb1',
      '--down-bg': 'rgba(255, 143, 177, 0.14)',
      '--accent-bg': 'rgba(79, 214, 255, 0.12)',
      '--accent-border': 'rgba(79, 214, 255, 0.36)',
      '--banner-bg':
        'radial-gradient(1100px 300px at 12% 0%, rgba(255, 143, 224, 0.22), transparent 60%), radial-gradient(900px 260px at 68% 8%, rgba(79, 214, 255, 0.24), transparent 60%), radial-gradient(700px 240px at 45% 100%, rgba(111, 240, 201, 0.16), transparent 65%), linear-gradient(135deg, #0e1e3c 0%, #071227 100%)',
      '--grid-line': 'rgba(110, 200, 255, 0.1)',
      '--bar-fill': 'linear-gradient(180deg, #4fd6ff 0%, #a78bfa 50%, #ff8fe0 100%)',
      '--bar-fill-hover': 'linear-gradient(180deg, #7de2ff 0%, #bfa9ff 50%, #ffa8e8 100%)',
    },
  },

  /** 七彩梦幻泡沫主题：浅底高饱和糖果色 */
  bubble: {
    id: 'bubble',
    name: '梦幻泡沫',
    swatch: 'linear-gradient(135deg, #38bdf8, #c026d3, #fb7185)',
    antd: {
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#c026d3',
        colorInfo: '#c026d3',
        colorLink: '#c026d3',
        colorTextBase: '#3d2450',
        colorBgLayout: '#f6ecfb',
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBorderSecondary: 'rgba(192, 38, 211, 0.16)',
        borderRadius: 14,
      },
      components: {
        Table: {
          headerBg: '#f2e3fc',
          headerColor: '#7c3a8f',
          rowHoverBg: '#faf0fd',
        },
        Menu: {
          itemColor: '#7a5c8a',
          itemHoverBg: 'rgba(192, 38, 211, 0.08)',
          itemSelectedBg: '#f2d9fb',
          itemSelectedColor: '#a21caf',
          itemHeight: 42,
        },
        Card: {
          colorBorderSecondary: 'rgba(192, 38, 211, 0.16)',
        },
        Button: {
          primaryShadow: '0 6px 18px -6px rgba(192, 38, 211, 0.5)',
        },
      },
    },
    vars: {
      '--sider-bg': '#fdf7fe',
      '--header-bg': '#fdf7fe',
      '--line': 'rgba(192, 38, 211, 0.18)',
      '--logo-text': '#3d2450',
      '--logo-icon': '#c026d3',
      '--icon-color': '#8a5c9e',
      '--icon-hover': '#c026d3',
      '--hover-bg': 'rgba(192, 38, 211, 0.08)',
      '--user-text': '#3d2450',
      '--footer-text': '#b39ac2',
      '--text-main': '#3d2450',
      '--text-sub': '#8a6b9c',
      '--up-text': '#0d9488',
      '--up-bg': 'rgba(20, 184, 166, 0.12)',
      '--down-text': '#e11d6b',
      '--down-bg': 'rgba(244, 63, 94, 0.12)',
      '--accent-bg': 'rgba(192, 38, 211, 0.1)',
      '--accent-border': 'rgba(192, 38, 211, 0.32)',
      '--banner-bg':
        'radial-gradient(600px 240px at 12% 20%, rgba(244, 114, 182, 0.5), transparent 60%), radial-gradient(700px 260px at 45% 0%, rgba(56, 189, 248, 0.45), transparent 60%), radial-gradient(650px 240px at 72% 30%, rgba(168, 85, 247, 0.45), transparent 60%), radial-gradient(560px 220px at 92% 15%, rgba(251, 113, 133, 0.35), transparent 60%), linear-gradient(135deg, #fdf2fd 0%, #f6ecfb 100%)',
      '--grid-line': 'rgba(192, 38, 211, 0.12)',
      '--bar-fill': 'linear-gradient(180deg, #38bdf8 0%, #c026d3 55%, #fb7185 100%)',
      '--bar-fill-hover': 'linear-gradient(180deg, #5cc9fa 0%, #d046e0 55%, #fb8a9c 100%)',
    },
  },

  /** 基础主题：经典浅色后台 */
  basic: {
    id: 'basic',
    name: '默认',
    swatch: 'linear-gradient(135deg, #1677ff, #69b1ff)',
    antd: {
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#1677ff',
        colorInfo: '#1677ff',
        colorBgLayout: '#f5f6f8',
        borderRadius: 8,
      },
      components: {
        Menu: {
          itemHeight: 42,
        },
      },
    },
    vars: {
      '--sider-bg': '#ffffff',
      '--header-bg': '#ffffff',
      '--line': '#f0f0f0',
      '--logo-text': 'rgba(0, 0, 0, 0.88)',
      '--logo-icon': '#1677ff',
      '--icon-color': 'rgba(0, 0, 0, 0.65)',
      '--icon-hover': '#1677ff',
      '--hover-bg': 'rgba(0, 0, 0, 0.04)',
      '--user-text': 'rgba(0, 0, 0, 0.88)',
      '--footer-text': 'rgba(0, 0, 0, 0.45)',
      '--text-main': 'rgba(0, 0, 0, 0.88)',
      '--text-sub': 'rgba(0, 0, 0, 0.55)',
      '--up-text': '#389e0d',
      '--up-bg': 'rgba(82, 196, 26, 0.12)',
      '--down-text': '#cf1322',
      '--down-bg': 'rgba(255, 77, 90, 0.12)',
      '--accent-bg': 'rgba(22, 119, 255, 0.08)',
      '--accent-border': 'rgba(22, 119, 255, 0.3)',
      '--banner-bg': 'linear-gradient(135deg, #f0f7ff 0%, #f5f7fa 100%)',
      '--grid-line': '#f0f0f0',
      '--bar-fill': 'linear-gradient(180deg, #1677ff 0%, #69b1ff 100%)',
      '--bar-fill-hover': 'linear-gradient(180deg, #4096ff 0%, #8cc5ff 100%)',
    },
  },

  /** 画墨主题：浓墨宣纸 + 朱砂点缀 */
  ink: {
    id: 'ink',
    name: '画墨',
    swatch: 'linear-gradient(135deg, #3e3a33, #a8433a)',
    antd: {
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#3e3a33',
        colorInfo: '#3e3a33',
        colorLink: '#a8433a',
        colorTextBase: '#2a2620',
        colorBgLayout: '#f3ede1',
        colorBgContainer: '#faf7f0',
        colorBgElevated: '#ffffff',
        colorBorderSecondary: '#e2dac8',
        borderRadius: 6,
      },
      components: {
        Table: {
          headerBg: '#ece4d2',
          headerColor: '#6b6152',
          rowHoverBg: '#f1ebe0',
        },
        Menu: {
          itemColor: '#6b6152',
          itemHoverBg: '#efe8d9',
          itemSelectedBg: '#e6ddc8',
          itemSelectedColor: '#2a2620',
          itemHeight: 42,
        },
        Card: {
          colorBorderSecondary: '#e2dac8',
        },
        Button: {
          primaryShadow: '0 6px 18px -6px rgba(62, 58, 51, 0.45)',
        },
      },
    },
    vars: {
      '--sider-bg': '#f7f2e7',
      '--header-bg': '#f7f2e7',
      '--line': '#e2dac8',
      '--logo-text': '#2a2620',
      '--logo-icon': '#3e3a33',
      '--icon-color': '#6b6152',
      '--icon-hover': '#a8433a',
      '--hover-bg': 'rgba(62, 58, 51, 0.06)',
      '--user-text': '#2a2620',
      '--footer-text': '#a39a88',
      '--text-main': '#2a2620',
      '--text-sub': '#6b6152',
      '--up-text': '#4d7c0f',
      '--up-bg': 'rgba(101, 138, 27, 0.12)',
      '--down-text': '#a8433a',
      '--down-bg': 'rgba(168, 67, 58, 0.12)',
      '--accent-bg': 'rgba(62, 58, 51, 0.07)',
      '--accent-border': 'rgba(168, 67, 58, 0.4)',
      '--banner-bg':
        'radial-gradient(800px 260px at 85% 10%, rgba(168, 67, 58, 0.12), transparent 60%), linear-gradient(135deg, #f3ede1 0%, #ece4d2 100%)',
      '--grid-line': 'rgba(62, 58, 51, 0.12)',
      '--bar-fill': 'linear-gradient(180deg, #6b6152 0%, #2a2620 100%)',
      '--bar-fill-hover': 'linear-gradient(180deg, #7d7261 0%, #3a342a 100%)',
    },
  },

  /** 宝石绿主题：浓翠祖母绿 */
  emerald: {
    id: 'emerald',
    name: '宝石绿',
    swatch: 'linear-gradient(135deg, #059669, #34d399)',
    antd: {
      algorithm: antdTheme.defaultAlgorithm,
      token: {
        colorPrimary: '#059669',
        colorInfo: '#059669',
        colorLink: '#059669',
        colorTextBase: '#123528',
        colorBgLayout: '#e3f2ea',
        colorBgContainer: '#ffffff',
        colorBgElevated: '#ffffff',
        colorBorderSecondary: 'rgba(5, 150, 105, 0.2)',
        borderRadius: 10,
      },
      components: {
        Table: {
          headerBg: '#dff0e7',
          headerColor: '#2f6d54',
          rowHoverBg: '#ecf7f1',
        },
        Menu: {
          itemColor: '#3f7a62',
          itemHoverBg: 'rgba(5, 150, 105, 0.08)',
          itemSelectedBg: '#c9ead9',
          itemSelectedColor: '#046b4b',
          itemHeight: 42,
        },
        Card: {
          colorBorderSecondary: 'rgba(5, 150, 105, 0.18)',
        },
        Button: {
          primaryShadow: '0 6px 18px -6px rgba(5, 150, 105, 0.5)',
        },
      },
    },
    vars: {
      '--sider-bg': '#eef8f2',
      '--header-bg': '#eef8f2',
      '--line': 'rgba(5, 150, 105, 0.22)',
      '--logo-text': '#123528',
      '--logo-icon': '#059669',
      '--icon-color': '#3f7a62',
      '--icon-hover': '#059669',
      '--hover-bg': 'rgba(5, 150, 105, 0.08)',
      '--user-text': '#123528',
      '--footer-text': '#7fae99',
      '--text-main': '#123528',
      '--text-sub': '#4a7a66',
      '--up-text': '#047857',
      '--up-bg': 'rgba(5, 150, 105, 0.14)',
      '--down-text': '#c2410c',
      '--down-bg': 'rgba(234, 88, 12, 0.12)',
      '--accent-bg': 'rgba(5, 150, 105, 0.1)',
      '--accent-border': 'rgba(5, 150, 105, 0.38)',
      '--banner-bg':
        'radial-gradient(700px 260px at 15% 0%, rgba(52, 211, 153, 0.35), transparent 60%), radial-gradient(900px 280px at 80% 20%, rgba(5, 150, 105, 0.25), transparent 60%), linear-gradient(135deg, #e6f6ee 0%, #e3f2ea 100%)',
      '--grid-line': 'rgba(5, 150, 105, 0.14)',
      '--bar-fill': 'linear-gradient(180deg, #34d399 0%, #059669 100%)',
      '--bar-fill-hover': 'linear-gradient(180deg, #4ade9f 0%, #0aa87a 100%)',
    },
  },
}

export const THEME_LIST: ThemeMeta[] = [
  THEMES.basic,
  THEMES.ink,
  THEMES.emerald,
  THEMES.starry,
  THEMES.nebula,
  THEMES.bubble,
]

export function getTheme(id: string): ThemeMeta {
  return THEMES[id as ThemeId] ?? THEMES.basic
}
