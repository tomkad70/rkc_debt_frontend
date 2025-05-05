<template>
  <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
    <div class="flex flex-col space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium text-gray-800">Фильтры</h2>

        <button
            v-if="isAdmin"
            @click="$emit('create-new')"
            type="button"
            class="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium cursor-pointer"
        >
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
          <select
              v-model="localFilters.registry_id"
              @change="applyFilters"
              class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="">Все реестры</option>
            <option v-for="r in registries" :key="r.id" :value="r.id">№-{{ r.number }}</option>
          </select>
        </div>

        <!-- Organization filter -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500">🏢</span>
          </div>
          <select
              v-model="localFilters.organization_id"
              @change="applyFilters"
              class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="">Все организации</option>
            <option v-for="org in organizations" :key="org.id" :value="org.id">{{ org.name }}</option>
          </select>
        </div>

        <!-- Status filter - replaced with multi-select -->
        <StatusMultiSelect
            :options="statusOptions"
            v-model="localFilters.statuses"
            placeholder="Выберите статус(ы)"
            @update:modelValue="applyFilters"
        />

        <!-- User filter -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-500">👨‍⚖</span>
          </div>
          <select
              v-model="localFilters.user_id"
              @change="applyFilters"
              class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="">Все юристы</option>
            <option v-for="u in lawyerUsers" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
        </div>
      </div>

      <!-- Active filters -->
      <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2">
        <div class="text-sm text-gray-500 self-center">Активные фильтры:</div>

        <div
            v-if="localFilters.registry_id"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          Реестр: №{{ getRegistryNumber(localFilters.registry_id) }}
          <button @click="clearFilter('registry_id')" type="button" class="ml-1 hover:text-blue-600 cursor-pointer">✕
          </button>
        </div>

        <div
            v-if="localFilters.organization_id"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
        >
          Организация: {{ getOrganizationName(localFilters.organization_id) }}
          <button @click="clearFilter('organization_id')" type="button"
                  class="ml-1 hover:text-indigo-600 cursor-pointer">✕
          </button>
        </div>

        <!-- Status tags list -->
        <StatusTagsList
            v-if="localFilters.statuses && localFilters.statuses.length > 0"
            :options="statusOptions"
            :selected="localFilters.statuses"
            @remove="removeStatus"
            @removeAll="clearFilter('statuses')"
        />

        <div
            v-if="localFilters.user_id"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
        >
          Юрист: {{ getUserName(localFilters.user_id) }}
          <button @click="clearFilter('user_id')" type="button" class="ml-1 hover:text-yellow-600 cursor-pointer">✕
          </button>
        </div>

        <button
            @click="resetFilters"
            type="button"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
        >
          Сбросить все
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed, reactive, watch} from 'vue'
import {StatusMultiSelect, StatusTagsList} from './index.js'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  registries: {
    type: Array,
    default: () => []
  },
  organizations: {
    type: Array,
    default: () => []
  },
  users: {
    type: Array,
    default: () => []
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:filters', 'apply-filters', 'create-new'])

// Local copy of filters
const localFilters = reactive({
  registry_id: props.filters.registry_id || '',
  organization_id: props.filters.organization_id || '',
  statuses: props.filters.statuses || [],
  user_id: props.filters.user_id || ''
})

// Synchronize local filters with props
watch(() => props.filters, (newFilters) => {
  localFilters.registry_id = newFilters.registry_id || ''
  localFilters.organization_id = newFilters.organization_id || ''
  localFilters.statuses = newFilters.statuses || []
  localFilters.user_id = newFilters.user_id || ''
}, {deep: true})

// Computed properties
const hasActiveFilters = computed(() => {
  return localFilters.registry_id !== '' ||
      localFilters.organization_id !== '' ||
      (localFilters.statuses && localFilters.statuses.length > 0) ||
      localFilters.user_id !== ''
})

const lawyerUsers = computed(() => {
  return props.users.filter(user => user.roles && user.roles.includes('lawyer'))
})

const statusOptions = computed(() => [
  {value: 'новая', label: '🆕 Новая'},
  {value: 'в работе', label: '⚙️ В работе'},
  {value: 'закрыта', label: '✅ Закрыта'}
])

// Methods
const applyFilters = () => {
  emit('update:filters', {...localFilters})
  emit('apply-filters')
}

const clearFilter = (filterName) => {
  if (filterName === 'statuses') {
    localFilters[filterName] = []
  } else {
    localFilters[filterName] = ''
  }
  applyFilters()
}

const removeStatus = (value) => {
  localFilters.statuses = localFilters.statuses.filter(status => status !== value)
  applyFilters()
}

const resetFilters = () => {
  localFilters.registry_id = ''
  localFilters.organization_id = ''
  localFilters.statuses = []
  localFilters.user_id = ''
  applyFilters()
}

// Helper methods
const getRegistryNumber = (registryId) => {
  const registry = props.registries.find(r => String(r.id) === String(registryId))
  return registry ? registry.number : '—'
}

const getOrganizationName = (orgId) => {
  const org = props.organizations.find(o => String(o.id) === String(orgId))
  return org ? org.name : '—'
}

const getUserName = (userId) => {
  const user = props.users.find(u => String(u.id) === String(userId))
  return user ? user.name : '—'
}
</script>