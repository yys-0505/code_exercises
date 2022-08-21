// import { defineStore } from 'pinia'
import { defineStore } from '@/pinia'
import { computed, reactive, toRefs } from 'vue'

export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 , fruits: ['apple', 'banana']}),
  getters: {
    double: (store) => {
      return store.count * 2
    }
  },
  actions: { // 同步异步都在action处理
    increment() {
      this.count ++
    },
    // increment() {
    //   return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //       // reject('error 123')
    //       resolve('success data')
    //     }, 1000)
    //   })
    // }
  }
})

// export const useCounterStore = defineStore('counter', () => {
//   const state = reactive({count: 0, fruits: ['apple', 'banana']})
//   const double = computed(() => state.count * 2)
//   const increment = () => state.count++
//   return {
//     ...toRefs(state),
//     double,
//     increment
//   }
// })