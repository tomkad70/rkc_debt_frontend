<template>
  <div class="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
    <div class="bg-white rounded-xl p-6 w-full max-w-3xl shadow-xl overflow-y-auto max-h-[90vh]">
      <h2 class="text-xl font-bold mb-4">⚙️ Права пользователя: {{ user.name }}</h2>

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label v-for="perm in permissions" :key="perm.name" class="flex items-center gap-2">
            <input type="checkbox" v-model="selected" :value="perm.name">
            <span>{{ perm.display_name || perm.name }}</span>
          </label>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button type="button" @click="$emit('close')" class="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Отмена</button>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">💾 Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const props = defineProps({ user: Object })
const emit = defineEmits(['close', 'updated'])

const permissions = ref([])
const selected = ref([])

const load = async () => {
  const all = await api.get('/permissions')
  const user = await api.get(`/users/${props.user.id}/permissions`)
  permissions.value = all.data
  selected.value = user.data
}

const save = async () => {
  await api.patch(`/users/${props.user.id}/permissions`, {
    permissions: selected.value
  })
  emit('updated')
  emit('close')
}

onMounted(load)
</script>