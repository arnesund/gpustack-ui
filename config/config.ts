import { defineConfig } from '@umijs/max';

import proxy from './proxy';
import routes from './routes';

export default defineConfig({
  proxy: {
    ...proxy()
  },
  base: process.env.npm_config_base || '/',
  // esbuildMinifyIIFE: true,
  jsMinifier: 'terser',
  cssMinifier: 'cssnano',
  presets: ['umi-presets-pro'],
  clickToComponent: {},
  antd: {
    style: 'less',
    configProvider: {
      componentSize: 'large',
      theme: {
        'root-entry-name': 'variable',
        cssVar: true,
        hashed: false,
        components: {
          Input: {
            inputFontSize: 12
          },
          Table: {
            cellFontSize: 12
          }
        },
        token: {
          colorPrimary: '#2fbf85',
          borderRadius: 16,
          fontSize: 12,
          motion: true
        }
      }
    }
  },
  hash: true,
  access: {},
  model: {},
  initialState: {},
  request: {},
  locale: {
    antd: true,
    baseNavigator: true,
    baseSeparator: '-',
    default: 'zh-CN',
    title: false,
    useLocalStorage: true
  },
  layout: false,
  routes,
  npmClient: 'pnpm'
}) as any;
