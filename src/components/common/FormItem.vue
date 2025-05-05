<template>
  <div class="space-y-2" :class="{ 'sm:col-span-2': fullWidth }">
    <label :class="labelClasses">
      <slot name="checkbox"></slot>
      {{ label }} <slot name="label-extra"></slot>
    </label>
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  /**
   * Текст метки поля
   */
  label: {
    type: String,
    required: true
  },

  /**
   * Флаг, указывающий, что поле должно занимать две колонки
   */
  fullWidth: {
    type: Boolean,
    default: false
  },

  /**
   * Флаг, указывающий, что это чекбокс
   */
  isCheckbox: {
    type: Boolean,
    default: false
  }
})

const labelClasses = computed(() => {
  return props.isCheckbox
      ? 'flex items-center text-sm font-medium text-gray-700'
      : 'block text-sm font-medium text-gray-700'
})
</script>