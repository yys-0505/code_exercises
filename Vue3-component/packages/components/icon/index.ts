// 整合组件并导出

import _Icon from './src/icon.vue'
import { withInstall } from '@test/utils/with-install'


const Icon = withInstall(_Icon)
export default Icon // 可通过app.use使用, 也可import单独使用

export * from './src/icon'

// 这里添加的类型 可以在模板中解析
// declare module 'vue' {
//   export interface GlobalComponents { // 接口可以自动合并
//     zicon: typeof Icon,
//     'z-icon': typeof Icon,
//   }
// }

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    ZIcon: typeof Icon
  }
}

export {}