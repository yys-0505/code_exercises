// 每个组件的入口文件
import CheckboxGroup from '../checkbox/src/checkbox-group.vue'
import { App } from 'vue'
CheckboxGroup.install = (app: App) => {
  app.component(CheckboxGroup.name, CheckboxGroup)
}

export default CheckboxGroup