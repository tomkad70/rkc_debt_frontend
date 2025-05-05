<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-xl w-full max-w-2xl shadow-xl overflow-y-auto max-h-[90vh]">
      <h2 class="text-xl font-semibold mb-4">Логи активности: {{ user.name }}</h2>

      <ul class="space-y-3">
        <li v-for="log in logs" :key="log.created_at + log.description" class="border-b pb-2">
          <div class="text-sm text-gray-700">
            📌 {{ log.description }}
          </div>
          <div class="text-xs text-gray-500">
            🕒 {{ log.created_at }} от 👤 {{ log.caused_by || '—' }}
          </div>
          <pre v-if="log.properties" class="mt-1 text-xs text-gray-600 bg-gray-100 p-2 rounded">{{ log.properties }}</pre>
        </li>
      </ul>

      <div class="flex justify-end mt-6">
        <button @click="$emit('close')" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Закрыть</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const props = defineProps({
  user: Object
})
const logs = ref([])

onMounted(async () => {
  const response = await api.get(`/users/${props.user.id}/logs`)
  logs.value = response.data
})
</script>
