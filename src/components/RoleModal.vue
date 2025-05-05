<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
      <h2 class="text-xl font-semibold mb-4">Изменить роль: {{ user.name }}</h2>

      <form @submit.prevent="submit">
        <label class="block text-sm font-medium mb-1">Роль</label>
        <select v-model="selectedRole" required class="w-full border border-gray-300 rounded p-2 mb-4">
          <option value="admin">Администратор</option>
          <option value="lawyer">Юрист</option>
          <option value="accountant">Бухгалтер</option>
        </select>

        <div class="flex justify-end space-x-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Отмена</button>
          <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Сохранить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api'

const props = defineProps({
  user: Object
})

const emit = defineEmits(['close', 'updated'])
const selectedRole = ref('')

watch(() => props.user, (val) => {
  selectedRole.value = val?.roles?.[0] || ''
}, { immediate: true })

const submit = async () => {
  await api.patch(`/users/${props.user.id}/roles`, {
    role: selectedRole.value
  })
  emit('updated')
  emit('close')
}
</script>
