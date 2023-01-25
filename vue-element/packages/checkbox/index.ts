// 每个组件的入口文件
import Checkbox from './src/checkbox.vue'
import { App } from 'vue'
Checkbox.install = (app: App) => {
  app.component(Checkbox.name, Checkbox)
}

export default Checkbox