<template>
  <div class="mb-6 bg-white rounded-lg shadow-sm p-5">
    <div class="flex flex-col sm:flex-row justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Заявки</h1>
        <p class="text-gray-500 mt-1">Управление и мониторинг заявок</p>
      </div>
      <div class="mt-4 sm:mt-0 flex flex-wrap gap-3">
        <div class="bg-blue-50 rounded-lg p-3">
          <div class="font-medium text-sm text-blue-800">Всего заявок</div>
          <div class="text-2xl font-bold text-blue-600">{{ totalApplications }}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-3">
          <div class="font-medium text-sm text-green-800">Активных</div>
          <div class="text-2xl font-bold text-green-600">{{ activeApplications }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalApplications: {
    type: Number,
    default: 0
  },
  activeApplications: {
    type: Number,
    default: 0
  }
})
</script>