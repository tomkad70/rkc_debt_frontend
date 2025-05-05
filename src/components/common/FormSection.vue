<template>
  <div class="bg-gray-50 p-4 rounded-lg">
    <h3 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
      <span class="mr-2">{{ icon }}</span>{{ title }}
    </h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Заголовок секции формы
   */
  title: {
    type: String,
    required: true
  },

  /**
   * Иконка секции формы (эмодзи)
   */
  icon: {
    type: String,
    default: '📋'
  }
})
</script>