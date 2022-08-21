import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createPinia } from '@/pinia'

const app = createApp(App)

const pinia = createPinia()

// 插件
pinia.use(function({ store }){
  store.$subscribe((state) => {
    console.log(state);
  })
})

app.use(pinia)



app.mount('#app')

/**
 * vuex缺点：ts兼容性不好；命名空间缺陷（只能有一个store）；有mutation和action的区别
 * pinia优点：ts兼容性好；不需要命名空间(可创建多个store)；mutation去掉，有状态、计算属性、动作
 * 体积更小巧一些
 */