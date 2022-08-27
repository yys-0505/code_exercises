import { createApp } from 'vue'
import App from './App.vue'
import store from './store'

import './assets/main.css'

// Vue.use(store): 插件的用法, 会默认调用store中的install方法
// use(store, 'my') 可以取个名字, 用的时候需要指定: const store = useStore('my'), 即可以多例
createApp(App).use(store).mount('#app')
