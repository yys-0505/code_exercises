import { createRouter, createWebHashHistory } from 'vue-router'

import Button from '../components/button.vue'
import Layout from '../components/layout.vue'
import Checkbox from '../components/checkbox.vue'

const routes = [
  {
    path: '/button',
    name: 'button',
    component: Button,
  },
  {
    path: '/layout',
    name: 'layout',
    component: Layout,
  },
  {
    path: '/',
    name: 'checkbox',
    component: Checkbox,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router