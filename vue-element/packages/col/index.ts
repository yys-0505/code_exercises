// 每个组件的入口文件
import Col from './src/col'
import { App } from 'vue'
Col.install = (app: App) => {
  app.component(Col.name, Col)
}

export default Col