<template>
  <AppLayout title="Договоры" :loading="loading">
    <div class="max-w-7xl mx-auto">
      <!-- Header with stats -->
      <div class="mb-6 bg-white rounded-lg shadow-sm p-5">
        <div class="flex flex-col sm:flex-row justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Отчёты</h1>
            <p class="text-gray-500 mt-1">Создание отчётов</p>
          </div>
          <div class="mt-4 sm:mt-0 flex  gap-3 text-center justify-between">
            <div class="bg-blue-50 rounded-lg p-3 w-full md:min-w-[200px]">
              <div class="font-medium text-sm text-blue-800">Всего договоров</div>
              <div class="text-2xl font-bold text-blue-600">{{ contracts.length }}</div>
            </div>
            <div class="bg-yellow-50 rounded-lg p-3 md:min-w-[200px] w-full">
              <div class="font-medium text-sm text-yellow-800">Активных</div>
              <div class="text-2xl font-bold text-yellow-600">{{ getActiveContractsCount() }}</div>
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

      <!-- Create/Edit Form -->
      <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
        <h2 class="text-lg font-medium text-gray-800 mb-4">
          {{ form.id ? 'Редактирование договора' : 'Добавление нового договора' }}
        </h2>
        <form @submit.prevent="save" class="grid gap-4 sm:grid-cols-4 lg:grid-cols-6">
          <div class="sm:col-span-2 lg:col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Организация</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">🏢</span>
              </div>
              <select
                  v-model="form.organization_id"
                  class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  :class="{'border-blue-500 bg-blue-50': form.id && form.organization_id}"
              >
                <option value="">Выберите организацию</option>
                <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</option>
              </select>
            </div>
          </div>

          <div class="sm:col-span-2 lg:col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Название договора</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">📜</span>
              </div>
              <input
                  v-model="form.title"
                  type="text"
                  placeholder="Название договора"
                  class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  :class="{'border-blue-500 bg-blue-50': form.id && form.title}"
              >
            </div>
          </div>

          <div class="sm:col-span-2 lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">📅</span>
              </div>
              <input
                  v-model="form.starts_at"
                  type="date"
                  class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  :class="{'border-blue-500 bg-blue-50': form.id && form.starts_at}"
              >
            </div>
          </div>

          <div class="sm:col-span-2 lg:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">📅</span>
              </div>
              <input
                  v-model="form.ends_at"
                  type="date"
                  class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer"
                  :class="{'border-blue-500 bg-blue-50': form.id && form.ends_at}"
              >
            </div>
          </div>

          <div class="col-span-full">
            <label class="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <div class="relative">
              <div class="absolute top-3 left-3 flex items-start pointer-events-none">
                <span class="text-gray-500">💬</span>
              </div>
              <textarea
                  v-model="form.comment"
                  placeholder="Комментарий к договору"
                  class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 min-h-24 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  :class="{'border-blue-500 bg-blue-50': form.id && form.comment}"
              ></textarea>
            </div>
          </div>

          <div class="col-span-full flex flex-wrap gap-2 mt-2">
            <button
                type="submit"
                class="px-4 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
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
                class="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium cursor-pointer"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>

      <!-- Contracts Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>🏢</span> Организация
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>📜</span> Название
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>📅</span> Период
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>💬</span> Комментарий
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="contract in contracts" :key="contract.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{{ contract.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ contract.organization_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ contract.title }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                    <span :class="getContractStatusClass(contract)">
                      {{ formatDate(contract.starts_at) }} - {{ formatDate(contract.ends_at) }}
                    </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 line-clamp-2">{{ contract.comment || '—' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end gap-2">
                  <button
                      @click="edit(contract)"
                      class="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button
                      @click="remove(contract.id)"
                      class="text-red-600 hover:text-red-900 p-1.5 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                      title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="contracts.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <div class="text-4xl mb-3">📜</div>
                  <div class="text-lg font-medium">Нет договоров</div>
                  <div class="text-sm">Добавьте первый договор с помощью формы выше</div>
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
import { ref, onMounted } from 'vue'
import api from '../api'
import AppLayout from './AppLayout.vue'

const contracts = ref([])
const organizations = ref([])
const loading = ref(true)
const form = ref({
  id: null,
  organization_id: '',
  title: '',
  starts_at: '',
  ends_at: '',
  comment: ''
})
const errorMessage = ref('')

const loadAll = async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const [cRes, oRes] = await Promise.all([
      api.get('/contracts'),
      api.get('/organizations')
    ])
    contracts.value = cRes.data.data || cRes.data
    organizations.value = oRes.data
  } catch (error) {
    console.error('Failed to load data:', error)
    errorMessage.value = 'Ошибка при загрузке данных'
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (!form.value.organization_id || !form.value.title) {
    errorMessage.value = 'Укажите организацию и название договора'
    return
  }

  loading.value = true
  errorMessage.value = ''
  try {
    const payload = { ...form.value }

    if (form.value.id) {
      await api.put(`/contracts/${form.value.id}`, payload)
    } else {
      await api.post('/contracts', payload)
    }

    resetForm()
    await loadAll()
  } catch (error) {
    if (error.response && error.response.data && error.response.data.errors) {
      // Обработка ошибок валидации
      const validationErrors = Object.values(error.response.data.errors).flat()
      errorMessage.value = validationErrors.join(', ')
    } else {
      errorMessage.value = 'Ошибка при сохранении договора'
    }
  } finally {
    loading.value = false
  }
}

const edit = (contract) => {
  errorMessage.value = ''
  form.value = {
    id: contract.id,
    organization_id: contract.organization_id,
    title: contract.title,
    starts_at: contract.starts_at,
    ends_at: contract.ends_at,
    comment: contract.comment
  }

  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const remove = async (id) => {
  if (confirm('Удалить договор?')) {
    loading.value = true
    errorMessage.value = ''
    try {
      await api.delete(`/contracts/${id}`)
      await loadAll()
    } catch (error) {
      console.error('Failed to delete contract:', error)

      // Обработка ошибки с сервера
      if (error.response && error.response.status === 422) {
        errorMessage.value = error.response.data.error || 'Невозможно удалить договор'
      } else {
        errorMessage.value = 'Произошла ошибка при удалении договора'
      }
    } finally {
      loading.value = false
    }
  }
}

const resetForm = () => {
  errorMessage.value = ''
  form.value = {
    id: null,
    organization_id: '',
    title: '',
    starts_at: '',
    ends_at: '',
    comment: ''
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '—'

  const date = new Date(dateString)
  return new Intl.DateTimeFormat('ru-RU').format(date)
}

const isContractActive = (contract) => {
  if (!contract.ends_at) return true

  const today = new Date()
  const endDate = new Date(contract.ends_at)
  return endDate >= today
}

const getContractStatusClass = (contract) => {
  if (!contract.ends_at) return ''

  const today = new Date()
  const endDate = new Date(contract.ends_at)

  // If contract expires in the next 30 days
  if (endDate >= today && endDate <= new Date(today.setDate(today.getDate() + 30))) {
    return 'text-yellow-600 font-medium'
  }

  // If contract is expired
  if (endDate < new Date()) {
    return 'text-red-600 font-medium'
  }

  return 'text-green-600 font-medium'
}

const getActiveContractsCount = () => {
  return contracts.value.filter(isContractActive).length
}

onMounted(loadAll)
</script>