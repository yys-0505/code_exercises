// 每个组件的入口文件
import Row from '../col/src/row'
import { App } from 'vue'
Row.install = (app: App) => {
  app.component(Row.name, Row)
}

export default Row