<template>
  <div v-if="visible" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-xl p-6 text-center">
      <svg class="animate-spin h-6 w-6 text-blue-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span class="text-lg text-gray-700">Загрузка...</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  visible: Boolean
})
</script>
