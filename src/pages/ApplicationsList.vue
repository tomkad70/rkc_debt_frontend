<template>
  <AppLayout title="Заявки" :loading="loading">
    <div class="max-w-7xl mx-auto">
      <!-- Header with stats -->
      <ApplicationsHeader
          :total-applications="totalApplications"
          :active-applications="activeApplications"
      />

      <!-- Filters section -->
      <FilterPanel
          v-model:filters="filters"
          :registries="registries"
          :organizations="organizations"
          :users="users"
          :is-admin="role === 'admin'"
          @apply-filters="loadApplications"
          @create-new="createNew"
      />

      <!-- Applications table -->
      <ApplicationsTable
          :applications="applications"
          :loading="loading"
          :has-active-filters="hasActiveFilters"
          @edit="openEdit"
      />
    </div>

    <!-- Loading indicator for application details -->
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

    <!-- Edit modal -->
    <EditApplicationModal
        v-if="selected && !selectedLoading"
        :application="selected"
        @close="selected = null"
        @updated="loadApplications"
    />
  </AppLayout>
</template>

<script setup>
import {ref, onMounted, computed} from 'vue'
import api from '@/api'
import AppLayout from '@/pages/AppLayout.vue'
import {ApplicationsHeader, ApplicationsTable,EditApplicationModal} from '@/components/application/index.js'
import {FilterPanel} from '@/components/filters/index.js'
import {buildQueryParams} from '@/utils/buildQuery'


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

// Фильтры для списка заявок с поддержкой мульти-выбора статусов
const filters = ref({
  registry_id: '',
  organization_id: '',
  statuses: [],
  user_id: ''
})

// Вычисляемые свойства
const hasActiveFilters = computed(() => {
  return filters.value.registry_id !== '' ||
      filters.value.organization_id !== '' ||
      filters.value.statuses.length > 0 ||
      filters.value.user_id !== ''
})

const lawyerUsers = computed(() => {
  return users.value.filter(user => user.roles && user.roles.includes('lawyer'))
})

// Получение роли текущего пользователя
const role = localStorage.getItem('role')
const userId = localStorage.getItem('user_id')

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
  }
}

// Загрузка заявок с применением фильтров
const loadApplications = async () => {
  loading.value = true

  try {
    // Словарь ключей → значений фильтров
    const paramsObject = {
      registry_id: filters.value.registry_id,
      organization_id: filters.value.organization_id,
      // передаём массив statuses под ключом 'status'
      status: filters.value.statuses,
      user_id: filters.value.user_id
    }
    // Собираем строку запроса: 'registry_id=…&status[]=новая&status[]=…'
    const qs = buildQueryParams(paramsObject)

    // Склеиваем URL
    const url = `/applications${qs ? `?${qs}` : ''}`

    const response = await api.get(url)
    applications.value = response.data.data || response.data

    // Обновление статистики
    await getStatistics()

  } catch (error) {
    console.error('Failed to load applications:', error)
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

// Открывает заявку для редактирования, загружая полные данные
const openEdit = async (app) => {
  try {
    selectedLoading.value = true

    // Загружаем полные данные заявки по ID
    const response = await api.get(`/applications/${app.id}`)
    const fullApplication = response.data.data || response.data

    // Восстанавливаем ID организации, если его нет в данных API
    if (fullApplication.organization && !fullApplication.organization_id) {
      const matchingOrg = organizations.value.find(
          org => org.name === fullApplication.organization
      );
      if (matchingOrg) {
        fullApplication.organization_id = matchingOrg.id;
      }
    }

    // Восстанавливаем ID юриста, если его нет в данных API
    if (fullApplication.lawyer && !fullApplication.user_id) {
      const matchingLawyer = users.value.find(
          user => user.name === fullApplication.lawyer
      );
      if (matchingLawyer) {
        fullApplication.user_id = matchingLawyer.id;
      }
    }

    // Инициализируем пустые массивы для услуг и этапов, если их нет
    if (!fullApplication.services) fullApplication.services = [];
    if (!fullApplication.steps) fullApplication.steps = [];

    selected.value = fullApplication;
  } catch (error) {
    console.error('Failed to load application details:', error)
    alert('Не удалось загрузить данные заявки. Попробуйте еще раз.')
  } finally {
    selectedLoading.value = false
  }
}

// Создает новую заявку с базовыми значениями
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

// Инициализация при монтировании компонента
onMounted(async () => {
  await loadReferenceData()
  await loadApplications()
})


</script>