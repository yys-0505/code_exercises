import { computed, defineComponent, h, inject } from "vue";

export default defineComponent({
  name: "XCol",
  props: {
    tag: {
			type: String,
			default: 'div'
    },
		span: {
			type: Number,
			default: 24,
		},
		offset: {
			type: Number,
			default: 0,
		},
  },
  setup(props, ctx) {
		const gutter = inject('XRow', 0)

		// 根据span offset 生成 x-col-span-5 x-col-offset-5
		const classs = computed(() => {
			const ret = []
			const tgtProps = ['span', 'offset'] as const;
			tgtProps.forEach(item => {
				const size = props[item]
				if (typeof size === 'number' && size > 0) {
					ret.push(`x-col-${item}-${size}`)
				}
			})

			return [
				'x-col',
				...ret
			]
		})

		// gutter 处理
		const styles = computed(() => {
			if (gutter !== 0) {
				return {
					paddingLeft: (gutter / 2) + 'px',
					paddingRight: (gutter / 2) + 'px',
				}
			}
			return {}
		})

		return () => h(props.tag, {
			class: classs.value,
			style: styles.value,
		}, ctx.slots.default?.())
	},
});
