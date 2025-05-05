<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">Вход в систему</h1>

      <form @submit.prevent="login">
        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Email</label>
          <input v-model="email" type="email" required
                 class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium mb-1">Пароль</label>
          <input v-model="password" type="password" required
                 class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition">
          Войти
        </button>
      </form>

      <p v-if="error" class="text-red-600 mt-4 text-center">{{ error }}</p>
    </div>
  </div>
</template>
<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import api from '../api'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref(null)

const login = async () => {
  error.value = null
  try {
    const response = await api.post('/login', {
      email: email.value,
      password: password.value
    })

    const {token, role} = response.data

    localStorage.setItem('token', token)
    localStorage.setItem('role', role)

    if (role === 'admin') {
      await router.push('/admin/users')
    } else {
      await router.push('/dashboard')
    }

  } catch (err) {
    error.value = 'Неверный логин или пароль'
  }
}
</script>
