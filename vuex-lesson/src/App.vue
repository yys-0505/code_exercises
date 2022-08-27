<script>
import { computed } from 'vue'
import { useStore } from '@/vuex'
export default {
  setup() {
    const store = useStore()
    function add() {
      store.commit('add', 1)
    }
    function asyncAdd() {
      store.dispatch('asyncAdd', 1).then(() => alert(1))
    }
    return {
      count: computed(() => store.state.count),
      double: computed(() => store.getters.double),
      add,
      asyncAdd,
      aCount: computed(() => store.state.aCount.count),
      bCount: computed(() => store.state.bCount.count),
      dCount: computed(() => store.state.aCount.dCount.count),
    }
  }
}
</script>

<template>
  count: {{ count }} {{ $store.state.count }} <br />
  double: {{ double }} {{ $store.getters.double }} <br />

  <!-- 严格模式报错 -->
  <button @click="$store.state.count++">非严格模式修改</button><br />

  <!-- 同步修改 -->
  <button @click="$store.commit('add', 1)">commit同步修改 $store.commit</button><br />
  <button @click="add">commit同步修改 add</button><br />
  <button @click="asyncAdd">commit异步修改</button><br />

  a模块: {{ aCount }}<br />
  b模块: {{ bCount }}<br />
  <button @click="$store.commit('aCount/add', 1)">改a</button><br />
  <button @click="$store.commit('bCount/add', 1)">改b</button><br />

  新模块d: {{ dCount }} <br />
  <button @click="$store.commit('aCount/dCount/add', 1)">改d</button><br />
</template>
