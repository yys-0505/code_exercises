<template>
  <i :class="`x-icon-${name}`"></i>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'XIcon',
  props: {
    name: {
      type: String,
      default: '',
    }
  },
  setup() {

  }
})
</script>