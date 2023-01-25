import { createApp } from "vue";
import App from './App.vue'

import router from './router/routers';

import Xui from "x-ui";
import 'theme-chalk/index.scss';

const app = createApp(App)
app.use(Xui)
app.use(router)
app.mount('#app')