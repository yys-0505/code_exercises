import { computed, getCurrentInstance } from "vue"
import { checkboxProps } from "./checkbox.type"

const useModel = (props: checkboxProps) => {
  const { emit } = getCurrentInstance()
  const model = computed({
    get() {
      return props.modelValue
    },
    set(val) {
      emit('update:modelValue', val)
    }
  })
  return model
}

const useCheckbox = (props: checkboxProps, model) => {
  const isChecked = computed(() => {
    const value = model.value
    return value
  })
  return isChecked
}

export const useCheckboxProps = (props: checkboxProps) => {
  const model = useModel(props)
  const isChecked = useCheckbox(props, model)
  return {
    model,
    isChecked
  }
}