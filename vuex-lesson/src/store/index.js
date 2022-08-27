import { createStore } from '@/vuex'

function customPlugin(store) {
  const local = localStorage.getItem('VUEX:STATE')
  if (local) {
    store.replaceState(JSON.parse(local))
  }
  store.subscribe((mutation, state) => { // 每当状态发生变化, 即调用mutation时执行此回调
    localStorage.setItem('VUEX:STATE', JSON.stringify(state))
  })
}

const store = createStore({
  plugins: [ // 按照顺序依次执行, 而且会传递store
    customPlugin
  ],
  strict: true, // 开始后这种写法会报错: $store.state.count++, 只能在mutation中修改状态
  state: {
    count: 1
  },
  getters: { // 计算属性, vuex4没有实现计算属性的功能
    double(state) {
      return state.count * 2
    }
  },
  mutations: { // 同步更改状态, 必须是同步更改
    add(state, payload) {
      state.count += payload
    }
  },
  actions: { // 可以调用其他action, 或者调用mutation
    asyncAdd({ commit }, payload) {
      setTimeout(() => {
        commit('add', payload)
      }, 2000)
    }
  },
  modules: {
    aCount: {
      namespaced: true,
      state: { count: 1 },
      mutations: {
        add(state, payload) {
          state.count += payload
        }
      },
      modules: {
        cCount: {
          namespaced: true,
          state: { count: 1 },
          mutations: {
            add(state, payload) {
              state.count += payload
            }
          },
          modules: {
            dCount: {
              namespaced: true,
              state: { count: 1 },
              mutations: {
                add(state, payload) {
                  state.count += payload
                }
              },
            }
          }
        }
      }
    },
    bCount: {
      namespaced: true,
      state: { count: 1 },
      mutations: {
        add(state, payload) {
          state.count += payload
        }
      },
    }
  }
})

store.registerModule(['aCount', 'dCount'], {
  namespaced: true,
  state: { count: 4 },
  mutations: {
    add(state, payload) {
      state.count += payload
    }
  },
})

export default store