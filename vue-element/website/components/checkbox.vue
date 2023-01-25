<template>
  <div>
    <h2>checkbox</h2>
    {{ checkboxVal }}
    <x-checkbox v-model="checkboxVal">checkbox</x-checkbox>
    <x-checkbox v-model="checkboxVal" disabled indeterminate>checkbox</x-checkbox>
    <x-checkbox-group></x-checkbox-group>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
  setup() {
    const checkboxVal = ref(true)
    return {
      checkboxVal
    }
  }
})
</script>

<style>

</style>