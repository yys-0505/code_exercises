<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import HelloWorld from './components/HelloWorld.vue'
import { useCounterStore } from './stores/counter'
const store = useCounterStore()
const { increment } = store

// setTimeout(() => {
//   store.$dispose()
// }, 1000)

const change = () => {
  store.count++
  // increment()

  // 批量改状态
  // store.$patch({
  //   count: ++store.count,
  //   fruits: [...store.fruits, 'orange']
  // })
  // store.$patch((store) => {
  //   store.count++
  //   store.fruits = [...store.fruits, 'orange']
  // })

  // store.$reset()

  // store.$state = { count: 100, fruits: [] }
}
// store.$subscribe((state, mutation) => {
//   console.log('数据变化', state, mutation)
// })

// store.$onAction(({after, onError, name}) => {
//   console.log('action excuted', name)
//   after((result) => {
//     console.log('data has been updated', result)
//   })
//   onError((error) => {
//     console.log('error happens', error);
//   })
// })
</script>

<template>
count: {{ store.count }} <br>
double: {{ store.double }} <br>
<button @click="change">change</button><br>
<!-- <button @click="store.increment">change</button> -->
<div v-for="item in store.fruits">
  {{ item }}
</div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
