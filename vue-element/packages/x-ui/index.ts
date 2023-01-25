// 进行整合
import { App } from 'vue'
import Button from '@x-ui/button'
import ButtonGroup from '@x-ui/button-group'
import Icon from '@x-ui/icon'
import Col from '@x-ui/col'
import Row from '@x-ui/row'
import Checkbox from '@x-ui/checkbox'
import CheckboxGroup from '@x-ui/checkbox-group'

const components = [ // 全部引入
  Button,
  ButtonGroup,
  Icon,
  Col,
  Row,
  Checkbox,
  CheckboxGroup,
]

const install = (app: App) => {
  components.forEach(component => {
    app.component(component.name, component)
  })
}

export default {
  install
}