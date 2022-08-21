<script>
import { useCounterStore } from './stores/counter'
import { mapState, mapActions, mapWritableState } from '@/pinia'
export default {
  computed: {
    // ...mapState(useCounterStore, ['count']), // 两种方式
    ...mapState(useCounterStore, {  f: 'fruits' }),
    ...mapWritableState(useCounterStore, ['count']), // 既能读又能写
    ...mapState(useCounterStore, ['double'])
  },
  methods: {
    ...mapActions(useCounterStore, ['increment'])
  }
}
</script>

<template>
count: {{ count }} <br>
double: {{ double }} <br>
<!-- <button @click='increment'>Add</button> -->
<button @click='count++'>Add</button>
<div v-for="item in f" key={{item}}>
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
