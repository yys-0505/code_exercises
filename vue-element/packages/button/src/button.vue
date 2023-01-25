<template>
  <button :class="classs">
    <i v-if="loading" class="x-icon-loading"></i>
    <i v-if="icon && !loading" :class="icon"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
type buttonType = "primary" | "danger" | "info" | "text"
export default defineComponent({
  name: 'XButton',
  props: {
    type: {
      type: String as PropType<buttonType>,
      validator: (val: string) => {
        return ["primary", "danger", "info", "text"].includes(val)
      },
      default: 'primary'
    },
    icon: {
      type: String, // x-icon-
      default: '',
    },
    disabled: Boolean,
    round: Boolean,
    loading: Boolean,
  },
  setup(props, ctx) {
    const classs = computed(() => [
      'x-button',
      'x-button--' + props.type,
      {
        'is-disabled': props.disabled,
        'is-round': props.round,
        'is-loading': props.loading,
      }
    ])

    return {
      classs
    }
  }
})
</script>