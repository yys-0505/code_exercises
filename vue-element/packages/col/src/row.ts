import { computed, defineComponent, h, provide } from "vue";

export default defineComponent({
  name: "XRow",
  props: {
    tag: {
			type: String,
			default: 'div',
    },
    gutter: {
      type: Number,
      default: 0,
    },
    justify: {
      type: String,
      default: 'start',
    },
  },
  setup(props, ctx) {
    provide('XRow', props.gutter)

    const classs = computed(() => {
      return [
        'x-row',
        props.justify !== 'start' ? `is-justify-${props.justify}` : ''
      ]
    })

    // 解决gutter开头结尾元素和容器对其
    const style = computed(() => {
      const ret = {
        marginLeft: '',
        marginRight: '',
      }
      if (props.gutter) {
        ret.marginLeft = ret.marginRight = `-${props.gutter / 2}px`
      }
      return ret
    })
		return () => h(props.tag, {
      class: classs.value,
      style: style.value,
    }, ctx.slots.default?.())
	},
});
