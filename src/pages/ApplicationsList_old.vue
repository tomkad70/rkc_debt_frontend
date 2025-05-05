<template>
  <AppLayout title="Заявки" :loading="loading">
    <div class="max-w-7xl mx-auto">
      <!-- Header with stats -->
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

      <!-- Filters section -->
      <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div class="flex flex-col space-y-4">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-medium text-gray-800">Фильтры</h2>

            <button v-if="role === 'admin'"
                    @click="createNew"
                    class="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium cursor-pointer">
              <span class="flex items-center justify-center gap-2">
                <span>➕</span> Создать заявку
              </span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <!-- Registry filter -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">📁</span>
              </div>
              <select v-model="filters.registry_id"
                      @change="applyFilters"
                      class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer">
                <option value="">Все реестры</option>
                <option v-for="r in registries" :key="r.id" :value="r.id">№-{{ r.number }}</option>
              </select>
            </div>

            <!-- Organization filter -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">🏢</span>
              </div>
              <select v-model="filters.organization_id"
                      @change="applyFilters"
                      class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer">
                <option value="">Все организации</option>
                <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</option>
              </select>
            </div>

            <!-- Status filter -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">📌</span>
              </div>
              <select v-model="filters.status"
                      @change="applyFilters"
                      class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer">
                <option value="">Все статусы</option>
                <option value="новая">🆕 Новая</option>
                <option value="в работе">⚙️ В работе</option>
                <option value="закрыта">✅ Закрыта</option>
              </select>
            </div>

            <!-- User filter -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500">👨‍⚖</span>
              </div>
              <select v-model="filters.user_id"
                      @change="applyFilters"
                      class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer">
                <option value="">Все юристы</option>
                <option v-for="u in lawyerUsers" :key="u.id" :value="u.id">{{ u.name }}</option>
              </select>
            </div>
          </div>

          <!-- Active filters -->
          <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2">
            <div class="text-sm text-gray-500 self-center">Активные фильтры:</div>
            <div v-if="filters.registry_id"
                 class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Реестр: №{{ getRegistryNumber(filters.registry_id) }}
              <button @click="clearFilter('registry_id')" class="ml-1 hover:text-blue-600 cursor-pointer">✕</button>
            </div>
            <div v-if="filters.organization_id"
                 class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              Организация: {{ getOrganizationName(filters.organization_id) }}
              <button @click="clearFilter('organization_id')" class="ml-1 hover:text-indigo-600 cursor-pointer">✕
              </button>
            </div>
            <div v-if="filters.status"
                 class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                 :class="getStatusBadgeClass(filters.status)">
              Статус: {{ filters.status }}
              <button @click="clearFilter('status')" class="ml-1 hover:opacity-70 cursor-pointer">✕</button>
            </div>
            <div v-if="filters.user_id"
                 class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Юрист: {{ getUserName(filters.user_id) }}
              <button @click="clearFilter('user_id')" class="ml-1 hover:text-yellow-600 cursor-pointer">✕</button>
            </div>
            <button @click="resetFilters"
                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer">
              Сбросить все
            </button>
          </div>
        </div>
      </div>

      <!-- Applications table -->
      <div class="bg-white rounded-xl shadow ring-1 ring-gray-200">
        <!-- Мобильные карточки -->
        <div class="sm:hidden divide-y divide-gray-200">
          <div class="p-4" v-for="app in applications"
               :key="app.id">
            <div class="text-sm text-gray-500">📅 <span
                class="font-medium text-gray-900">{{ formatDate(app.application_date) }}</span></div>
            <div class="text-sm text-gray-500">🏢 <span class="text-gray-900">{{ app.organization }}</span></div>
            <div class="text-sm text-gray-500">👨 <span class="text-gray-900">{{ app.debtor_address }}</span></div>
            <div class="text-sm text-gray-500">📂 <span class="text-gray-900">{{ app.action_type }}</span></div>
            <div class="text-sm text-gray-500">📁 <span
                class="text-gray-900">{{ app.registry_number ? `📁 №${app.registry_number}` : '—' }}</span></div>
            <div class="text-sm text-gray-500">📌 <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="getStatusBadgeClass(app.status)">
                    {{ app.status }}
                  </span></div>
            <div class="text-sm text-gray-500">👨 <span class="text-gray-900">{{ app.lawyer || '—' }}</span></div>
            <div class="text-sm text-gray-500">💰 <span class="text-gray-900">0 руб.</span></div>
            <div class="mt-2 text-center">
              <button
                  @click.stop="openEdit(app)"
                  class="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Редактировать заявку">
                Редактировать заявку
              </button>
            </div>
          </div>
        </div>
        <!-- Таблица для десктопа -->
        <div class="hidden sm:block overflow-x-auto relative">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ИД
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>📅</span> Дата
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>🏢</span> Организация
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>👨</span> Адрес должника
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>📂</span> Действие
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>📁</span> Реестр
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>📌</span> Статус
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>👨</span> Юрист
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>💰</span> Расчёт
                </div>
              </th>

              <!-- фиксированная колонка -->
              <th class="px-4 py-3 bg-white sticky right-0 z-10 text-xs text-gray-500 uppercase tracking-wider text-center">Действия</th>
            </tr>

            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="app in applications"
                :key="app.id"
                class="hover:bg-gray-50 transition-colors cursor-pointer"
                @dblclick="openEdit(app)">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{{ app.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(app.application_date) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ app.organization }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ app.debtor_address }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ app.action_type }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ app.registry_number ? `📁 №${app.registry_number}` : '—' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="getStatusBadgeClass(app.status)">
                    {{ app.status }}
                  </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ app.lawyer || '—' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">0 руб.</div>
              </td>
              <!-- кнопка в фиксированной колонке -->
              <td class="px-4 py-4 whitespace-nowrap sticky right-0 bg-white text-right">
                <button @click.stop="openEdit(app)"
                        class="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="Редактировать заявку">✏️</button>
              </td>
            </tr>
            <tr v-if="applications.length === 0 && !loading">
              <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <div class="text-4xl mb-3">📋</div>
                  <div class="text-lg font-medium">Заявки не найдены</div>
                  <div class="text-sm">
                    {{ hasActiveFilters ? 'Попробуйте изменить параметры фильтрации' : 'Создайте новую заявку' }}
                  </div>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <!-- Добавляем индикатор загрузки при открытии заявки -->
    <div v-if="selectedLoading" class="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div class="bg-white p-5 rounded-lg shadow-lg flex items-center">
        <svg class="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-700">Загрузка данных заявки...</span>
      </div>
    </div>
    <EditApplicationModal
        v-if="selected && !selectedLoading"
        :application="selected"
        @close="selected = null"
        @updated="loadApplications"
    />
  </AppLayout>
</template>

<script setup>
import {ref, onMounted, computed, reactive} from 'vue'
import api from '../api'
import AppLayout from '@/pages/AppLayout.vue'
import EditApplicationModal from '@/components/application/EditApplicationModal.vue'

// Данные для списка заявок
const applications = ref([])
const registries = ref([])
const organizations = ref([])
const users = ref([])

// Состояния загрузки
const loading = ref(true)
const selectedLoading = ref(false)

// Детальные данные заявки для редактирования
const selected = ref(null)

// Статистика для панели управления
const totalApplications = ref(0)
const activeApplications = ref(0)

// Фильтры для списка заявок
const filters = reactive({
  registry_id: '',
  organization_id: '',
  status: '',
  user_id: ''
})

// Получение роли текущего пользователя
const role = localStorage.getItem('role')
const userId = localStorage.getItem('user_id')

// Вычисляемые свойства
const hasActiveFilters = computed(() => {
  return Object.values(filters).some(val => val !== '')
})

const lawyerUsers = computed(() => {
  return users.value.filter(user => user.roles && user.roles.includes('lawyer'))
})

// Загрузка справочных данных (организации, реестры, пользователи)
const loadReferenceData = async () => {
  try {
    const [orgsRes, regsRes, usersRes] = await Promise.all([
      api.get('/organizations'),
      api.get('/registries'),
      api.get('/users')
    ])

    organizations.value = orgsRes.data.data || orgsRes.data
    registries.value = regsRes.data.data || regsRes.data
    users.value = usersRes.data.data || usersRes.data
  } catch (error) {
    console.error('Failed to load reference data:', error)
    // Можно добавить уведомление пользователя о проблеме
  }
}

// Загрузка заявок с применением фильтров
const loadApplications = async () => {
  loading.value = true

  try {
    // Формирование параметров запроса на основе фильтров
    const params = new URLSearchParams()

    if (filters.registry_id) params.append('registry_id', filters.registry_id)
    if (filters.organization_id) params.append('organization_id', filters.organization_id)
    if (filters.status) params.append('status', filters.status)
    if (filters.user_id) params.append('user_id', filters.user_id)

    // Формирование URL с параметрами
    const url = `/applications${params.toString() ? `?${params.toString()}` : ''}`

    const response = await api.get(url)
    applications.value = response.data.data || response.data

    // Обновление статистики
    await getStatistics()

    console.log('Applications loaded:', applications.value.length)
  } catch (error) {
    console.error('Failed to load applications:', error)
    // Можно добавить уведомление пользователя о проблеме
  } finally {
    loading.value = false
  }
}

// Получение статистики заявок (общее количество и активные)
const getStatistics = async () => {
  try {
    const response = await api.get('/applications/stats')
    if (response.data) {
      totalApplications.value = response.data.total || 0
      activeApplications.value = response.data.active || 0
    } else {
      // Если API не поддерживает статистику, вычисляем на клиенте
      totalApplications.value = applications.value.length
      activeApplications.value = applications.value.filter(app => app.status !== 'закрыта').length
    }
  } catch (error) {
    console.error('Failed to load statistics:', error)
    // Вычисляем на клиенте в случае ошибки
    totalApplications.value = applications.value.length
    activeApplications.value = applications.value.filter(app => app.status !== 'закрыта').length
  }
}

// Методы для работы с фильтрами
const applyFilters = () => {
  loadApplications()
}

const clearFilter = (filterName) => {
  filters[filterName] = ''
  loadApplications()
}

const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  loadApplications()
}

// Вспомогательные функции для отображения данных
const getRegistryNumber = (registryId) => {
  const registry = registries.value.find(r => String(r.id) === String(registryId))
  return registry ? registry.number : '—'
}

const getOrganizationName = (orgId) => {
  const org = organizations.value.find(o => String(o.id) === String(orgId))
  return org ? org.name : '—'
}

const getUserName = (userId) => {
  const user = users.value.find(u => String(u.id) === String(userId))
  return user ? user.name : '—'
}

// Функции для работы с заявками
/**
 * Открывает заявку для редактирования, загружая полные данные
 * @param {Object} app Базовая информация о заявке из списка
 */
/**
 * Открывает заявку для редактирования, загружая полные данные
 * и восстанавливая необходимые ID из имен
 * @param {Object} app Базовая информация о заявке из списка
 */
const openEdit = async (app) => {
  try {
    selectedLoading.value = true

    // Загружаем полные данные заявки по ID
    const response = await api.get(`/applications/${app.id}`)
    const fullApplication = response.data.data || response.data

    console.log('Получены данные заявки:', fullApplication)

    // Восстанавливаем ID организации, если его нет в данных API
    if (fullApplication.organization && !fullApplication.organization_id) {
      const matchingOrg = organizations.value.find(
          org => org.name === fullApplication.organization
      );
      if (matchingOrg) {
        fullApplication.organization_id = matchingOrg.id;
        console.log('Восстановлен organization_id:', fullApplication.organization_id);
      } else {
        console.warn('Не удалось найти организацию с именем:', fullApplication.organization);
      }
    }

    // Восстанавливаем ID юриста, если его нет в данных API
    if (fullApplication.lawyer && !fullApplication.user_id) {
      const matchingLawyer = users.value.find(
          user => user.name === fullApplication.lawyer
      );
      if (matchingLawyer) {
        fullApplication.user_id = matchingLawyer.id;
        console.log('Восстановлен user_id:', fullApplication.user_id);
      } else {
        console.warn('Не удалось найти юриста с именем:', fullApplication.lawyer);
      }
    }

    // Инициализируем пустые массивы для услуг и этапов, если их нет
    if (!fullApplication.services) fullApplication.services = [];
    if (!fullApplication.steps) fullApplication.steps = [];

    // Устанавливаем полные данные для редактирования
    selected.value = fullApplication;
  } catch (error) {
    console.error('Failed to load application details:', error)
    alert('Не удалось загрузить данные заявки. Попробуйте еще раз.')
  } finally {
    selectedLoading.value = false
  }
}

/**
 * Создает новую заявку с базовыми значениями
 */
const createNew = () => {
  selected.value = {
    id: null,
    status: 'новая',
    application_date: new Date().toISOString().split('T')[0],
    // Если текущий пользователь - юрист, устанавливаем его как исполнителя
    user_id: role === 'lawyer' ? userId : null,
    // Пустые массивы для этапов и услуг
    steps: [],
    services: []
  }
}

/**
 * Возвращает классы для стилизации статуса заявки
 * @param {string} status Статус заявки
 * @returns {string} CSS-классы для стилизации
 */
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'новая': 'bg-blue-100 text-blue-800',
    'в работе': 'bg-yellow-100 text-yellow-800',
    'закрыта': 'bg-green-100 text-green-800'
  }

  return status ? statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'
}

/**
 * Форматирует дату в локальный формат
 * @param {string} dateString Строка с датой
 * @returns {string} Отформатированная дата
 */
const formatDate = (dateString) => {
  if (!dateString) return '—'

  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('ru-RU').format(date)
  } catch (e) {
    console.error('Invalid date:', dateString, e)
    return dateString || '—'
  }
}

// Инициализация при монтировании компонента
onMounted(async () => {
  await loadReferenceData()
  await loadApplications()
})
</script>