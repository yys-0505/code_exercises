// 处理解析ts中声明的.vue文件

declare module "*.vue" {
  import { App, defineComponent } from "vue";
  const component: ReturnType<typeof defineComponent> & {
    install(app: App): void
  }
  export default component
}