<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300">
    <div @click.stop
         class="bg-white p-6 rounded-xl w-full max-w-md shadow-xl relative animate-modal-appear">
      <!-- Modal Header -->
      <div class="border-b pb-4 mb-5">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">
            <span class="mr-2">👤</span>Добавить пользователя
          </h2>
          <button @click="$emit('close')"
                  class="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-gray-500 text-sm mt-1">
          Создание нового пользователя в системе
        </p>
      </div>

      <form @submit.prevent="submit">
        <div class="space-y-4">
          <!-- Name Field -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Имя</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">👤</span>
              </div>
              <input
                  v-model="name"
                  type="text"
                  required
                  class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Введите имя пользователя"
              >
            </div>
          </div>

          <!-- Email Field -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">✉️</span>
              </div>
              <input
                  v-model="email"
                  type="email"
                  required
                  class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="email@example.com"
              >
            </div>
          </div>

          <!-- Password Field -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Пароль</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">🔒</span>
              </div>
              <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Введите пароль"
              >
              <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <span v-if="showPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
              </button>
            </div>
            <p class="text-xs text-gray-500">Пароль должен содержать минимум 8 символов</p>
          </div>

          <!-- Password Confirmation Field -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Подтверждение пароля</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">🔒</span>
              </div>
              <input
                  v-model="password_confirmation"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  required
                  class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Повторите пароль"
                  :class="{'border-red-500 focus:border-red-500 focus:ring-red-500': passwordMismatch}"
              >
              <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <span v-if="showConfirmPassword">👁️</span>
                <span v-else>👁️‍🗨️</span>
              </button>
            </div>
            <p v-if="passwordMismatch" class="text-xs text-red-500">Пароли не совпадают</p>
          </div>

          <!-- Role Field -->
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">Роль</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">🔰</span>
              </div>
              <select
                  v-model="role"
                  required
                  class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none cursor-pointer bg-white"
              >
                <option value="admin">Администратор</option>
                <option value="lawyer">Юрист</option>
                <option value="accountant">Бухгалтер</option>
              </select>
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>
            <div class="mt-1 text-xs">
              <span v-if="role === 'admin'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Администратор - полный доступ
              </span>
              <span v-if="role === 'lawyer'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Юрист - работа с заявками
              </span>
              <span v-if="role === 'accountant'" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Бухгалтер - финансовые операции
              </span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            <div class="flex items-center">
              <span class="mr-2">⚠️</span>
              <span>{{ error }}</span>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 border-t pt-4">
          <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            Отмена
          </button>
          <button
              type="submit"
              class="px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
              :disabled="isSubmitting"
          >
            <span class="flex items-center justify-center">
              <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="mr-2">{{ isSubmitting ? 'Создание...' : '➕' }}</span>
              Создать пользователя
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, watch} from 'vue'
import api from '../api'

const emit = defineEmits(['close', 'created'])
const name = ref('')
const email = ref('')
const password = ref('')
const password_confirmation = ref('')
const role = ref('lawyer')
const error = ref(null)
const isSubmitting = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordMismatch = computed(() => {
  return password.value && password_confirmation.value &&
      password.value !== password_confirmation.value
})

// Clear error when form values change
watch([name, email, password, password_confirmation, role], () => {
  error.value = null
})

const submit = async () => {
  // Client-side validation
  if (passwordMismatch.value) {
    error.value = 'Пароли не совпадают'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Пароль должен содержать минимум 8 символов'
    return
  }

  error.value = null
  isSubmitting.value = true

  try {
    await api.post('/users', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: password_confirmation.value,
      role: role.value
    })

    emit('created')
  } catch (err) {
    console.error('Error creating user:', err)

    if (err.response?.data?.errors) {
      // Extract first validation error
      const firstError = Object.values(err.response.data.errors)[0]
      error.value = Array.isArray(firstError) ? firstError[0] : firstError
    } else {
      error.value = err.response?.data?.message || 'Ошибка при создании пользователя'
    }
  } finally {
    isSubmitting.value = false
  }
}
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