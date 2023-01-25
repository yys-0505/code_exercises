// 每个组件的入口文件
import Icon from './src/icon.vue'
import { App } from 'vue'
Icon.install = (app: App) => {
  app.component(Icon.name, Icon)
}

export default Icon