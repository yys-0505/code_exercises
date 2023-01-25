<template>
  <div class="x-checkbox">
		<span class="x-checkbox__input">
			<input
				type="checkbox"
				v-model="model"
				:indeterminate="indeterminate"
				:disabled="disabled"
				:name="name"
			>
		</span>
		<span class="x-checkbox__label">
			<slot></slot>
		</span>
	</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useCheckboxProps } from './useCheckboxProps'
export default defineComponent({
	name: 'XCheckbox',
	props: {
		indeterminate: Boolean,
		checked: Boolean,
		name: String,
		disabled: Boolean,
		label: [String, Number, Boolean, Object],
		modelValue: [String, Number, Boolean],
	},
	emits: ['update:modelValue'],
	setup(props) {
		return useCheckboxProps(props) // {model, isChecked}
	}
})
</script>

<style>

</style>