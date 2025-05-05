<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
      <h2 class="text-xl font-semibold mb-4">Сбросить пароль: {{ user.name }}</h2>

      <form @submit.prevent="submit">
        <label class="block text-sm font-medium mb-1">Новый пароль</label>
        <input v-model="password" type="password" required class="w-full border border-gray-300 rounded p-2 mb-4">

        <label class="block text-sm font-medium mb-1">Подтверждение</label>
        <input v-model="confirm" type="password" required class="w-full border border-gray-300 rounded p-2 mb-4">

        <div v-if="error" class="text-red-600 mb-4">{{ error }}</div>

        <div class="flex justify-end space-x-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Отмена</button>
          <button type="submit" class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Сбросить</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '../api'

const props = defineProps({
  user: Object
})

const emit = defineEmits(['close'])
const password = ref('')
const confirm = ref('')
const error = ref(null)

const submit = async () => {
  error.value = null
  if (password.value !== confirm.value) {
    error.value = 'Пароли не совпадают'
    return
  }

  try {
    await api.patch(`/users/${props.user.id}/reset-password`, {
      password: password.value,
      password_confirmation: confirm.value
    })
    emit('close')
  } catch (err) {
    error.value = 'Ошибка при сбросе пароля'
  }
}
</script>
