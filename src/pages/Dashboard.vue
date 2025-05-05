<template>
  <AppLayout title="Главная" :loading="loading">
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white rounded-xl shadow p-4 flex flex-col items-start">
        <span class="text-gray-500 text-sm">📊 Всего заявок</span>
        <span class="text-2xl font-bold">{{ total }}</span>
      </div>

      <div class="bg-white rounded-xl shadow p-4 flex flex-col items-start">
        <span class="text-gray-500 text-sm">🆕 Новых заявок</span>
        <span class="text-2xl font-bold">{{ newCount }}</span>
      </div>

      <div class="bg-white rounded-xl shadow p-4 flex flex-col items-start">
        <span class="text-gray-500 text-sm">💼 Моих заявок</span>
        <span class="text-2xl font-bold">{{ mine }}</span>
      </div>

      <div class="bg-white rounded-xl shadow p-4 flex items-center justify-center">
        <router-link to="/applications" class="text-blue-600 font-semibold hover:underline">
          👉 Перейти к списку заявок
        </router-link>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import AppLayout from './AppLayout.vue'
import api from '../api'

const total = ref(0)
const newCount = ref(0)
const mine = ref(0)
const loading = ref(true)

const role = localStorage.getItem('role')
const userId = localStorage.getItem('user_id')

const loadStats = async () => {
  const {data} = await api.get('/applications')
  const apps = data.data || data
  total.value = apps.length
  newCount.value = apps.filter(a => a.status === 'новая').length
  mine.value = apps.filter(a => a.user_id == userId).length
  loading.value = false
}

onMounted(loadStats)
</script>