<template>
  <AppLayout title="Организации" :loading="loading">
    <div class="max-w-7xl mx-auto">
      <!-- Header with stats -->
      <div class="mb-6 bg-white rounded-lg shadow-sm p-5">
        <div class="flex flex-col sm:flex-row justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Организации</h1>
            <p class="text-gray-500 mt-1">Управление списком организаций</p>
          </div>
          <div class="mt-4 sm:mt-0 flex items-center">
            <div class="bg-blue-50 rounded-lg p-3 text-center w-full">
              <div class="font-medium text-sm text-blue-800">Всего организаций</div>
              <div class="text-2xl font-bold text-blue-600">{{ organizations.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <span class="text-red-600 text-lg">⚠️</span>
        <div class="text-red-800">{{ errorMessage }}</div>
        <button @click="errorMessage = ''" class="ml-auto text-gray-500 hover:text-gray-700">
          <span>✕</span>
        </button>
      </div>

      <!-- Create/Update Form -->
      <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
        <h2 class="text-lg font-medium text-gray-800 mb-4">
          {{ form.id ? 'Редактирование организации' : 'Добавление новой организации' }}
        </h2>
        <form @submit.prevent="createOrg" class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div class="relative flex-grow">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500">🏢</span>
            </div>
            <input
                v-model="form.name"
                type="text"
                placeholder="Название организации"
                class="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                :class="{'border-blue-500 bg-blue-50': form.id}"
            >
          </div>
          <div class="relative flex-grow">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500">🧾</span>
            </div>
            <input
                v-model="form.inn"
                type="text"
                placeholder="ИНН организации"
                class="pl-10 w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                :class="{'border-blue-500 bg-blue-50': form.id}"
            >
          </div>
          <div class="flex gap-2 w-full sm:w-auto">
            <button
                type="submit"
                class="px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto"
                :class="form.id ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500' : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'"
            >
              <span v-if="form.id" class="flex items-center justify-center gap-1">
                <span>💾</span> Обновить
              </span>
              <span v-else class="flex items-center justify-center gap-1">
                <span>➕</span> Добавить
              </span>
            </button>
            <button
                v-if="form.id"
                @click.prevent="resetForm"
                class="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto font-medium"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>🏢</span> Название
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>🧾</span> ИНН
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>📅</span> Создано
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="org in organizations" :key="org.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{{ org.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ org.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ org?.inn }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ formatDate(org.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button
                      @click="editOrg(org)"
                      class="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded p-1"
                      title="Редактировать"
                  >
                    <span>✏️</span>
                  </button>
                  <button
                      @click="deleteOrg(org.id)"
                      class="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded p-1"
                      title="Удалить"
                  >
                    <span>🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="organizations.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <div class="text-4xl mb-3">📋</div>
                  <div class="text-lg font-medium">Нет организаций</div>
                  <div class="text-sm">Добавьте первую организацию с помощью формы выше</div>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import {ref, onMounted} from 'vue'
import api from '../api'
import AppLayout from './AppLayout.vue'

const organizations = ref([])
const loading = ref(true)
const form = ref({id: null, name: '', inn: ''})
const errorMessage = ref('')

const loadOrgs = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const {data} = await api.get('/organizations')
    organizations.value = data
  } catch (error) {
    console.error('Failed to load organizations:', error)
    errorMessage.value = 'Ошибка при загрузке списка организаций.'
  } finally {
    loading.value = false
  }
}

const createOrg = async () => {
  if (!form.value.name.trim()) return

  loading.value = true
  errorMessage.value = ''
  try {
    if (form.value.id) {
      await api.put(`/organizations/${form.value.id}`, {name: form.value.name, inn: form.value.inn})
    } else {
      await api.post('/organizations', {name: form.value.name, inn: form.value.inn})
    }
    resetForm()
    await loadOrgs()
  } catch (error) {
    console.error('Failed to save organization:', error)

    if (error.response && error.response.data && error.response.data.errors) {
      // Обработка ошибок валидации
      const validationErrors = Object.values(error.response.data.errors).flat()
      errorMessage.value = validationErrors.join(', ')
    } else {
      errorMessage.value = 'Ошибка при сохранении организации.'
    }
  } finally {
    loading.value = false
  }
}

const editOrg = (org) => {
  errorMessage.value = ''
  form.value = {
    id: org.id,
    name: org.name,
    inn: org.inn || ''
  }
}

// const deleteOrg = async (id) => {
//   if (confirm('Удалить организацию?')) {
//     loading.value = true
//     try {
//       await api.delete(`/organizations/${id}`)
//       await loadOrgs()
//     } catch (error) {
//       console.error('Failed to delete organization:', error)
//     } finally {
//       loading.value = false
//     }
//   }
// }

const deleteOrg = async (id) => {
  if (confirm('Удалить организацию?')) {
    loading.value = true
    errorMessage.value = ''
    try {
      await api.delete(`/organizations/${id}`)
      await loadOrgs()
    } catch (error) {
      console.error('Failed to delete organization:', error)

      // Обработка ошибки с сервера
      if (error.response && error.response.status === 422) {
        errorMessage.value = error.response.data.error || 'Невозможно удалить организацию.'
      } else {
        errorMessage.value = 'Произошла ошибка при удалении организации.'
      }
    } finally {
      loading.value = false
    }
  }
}

const resetForm = () => {
  form.value = {id: null, name: '', inn: ''}
}

const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU').format(date)
}

onMounted(loadOrgs)
</script>