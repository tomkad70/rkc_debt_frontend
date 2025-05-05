<template>
  <div
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300">
    <div
        @click.stop
        class="bg-white p-6 rounded-xl w-full max-w-4xl shadow-xl relative overflow-y-auto max-h-[90vh] animate-modal-appear"
    >
      <!-- Modal Header -->
      <div class="border-b pb-4 mb-5">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">
            <span class="mr-2">{{ icon }}</span>{{ title }}
          </h2>
          <button
              @click="$emit('close')"
              class="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <p class="text-gray-500 text-sm mt-1">
          {{ subtitle }}
        </p>
      </div>

      <!-- Modal Content (default slot) -->
      <div class="modal-content">
        <slot></slot>
      </div>

      <!-- Modal Footer Buttons -->
      <div class="mt-6 flex justify-end space-x-3 border-t pt-4">
        <slot name="footer"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  /**
   * Заголовок модального окна
   */
  title: {
    type: String,
    required: true
  },

  /**
   * Подзаголовок модального окна
   */
  subtitle: {
    type: String,
    default: ''
  },

  /**
   * Иконка модального окна (эмодзи)
   */
  icon: {
    type: String,
    default: '📝'
  }
})

defineEmits(['close'])
</script>

<style scoped>
.animate-modal-appear {
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>