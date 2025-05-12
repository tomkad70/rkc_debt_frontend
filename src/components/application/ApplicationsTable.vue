<template>
  <div class="bg-white rounded-xl shadow ring-1 ring-gray-200">
    <!-- Mobile cards view -->
    <div class="sm:hidden divide-y divide-gray-200">
      <div
          v-for="app in applications"
          :key="app.id"
          class="p-4"
      >

        <div class="text-sm text-gray-500">📅 <span class="font-medium text-gray-900">{{
            formatDate(app.application_date)
          }}</span></div>
        <div class="text-sm text-gray-500">🏢 <span class="text-gray-900">{{ app.organization }}</span></div>
        <div class="text-sm text-gray-500">👨 <span class="text-gray-900">{{ app.debtor_address }}</span></div>
        <div class="text-sm text-gray-500">📂 <span class="text-gray-900">{{ app.action_type }}</span></div>
        <div class="text-sm text-gray-500">📁 <span
            class="text-gray-900">{{ app.registry_number ? `📁 №${app.registry_number}` : '—' }}</span></div>
        <div class="text-sm text-gray-500">📌
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="getStatusBadgeClass(app.status)">
            {{ app.status }}
          </span>
        </div>
        <div class="text-sm text-gray-500">👨 <span class="text-gray-900">{{ app.lawyer || '—' }}</span></div>
        <div class="text-sm text-gray-500">💰 <span class="text-gray-900">0 руб.</span></div>
        <div class="mt-2 text-center">
          <button
              @click.stop="$emit('edit', app)"
              class="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Редактировать заявку"
          >
            Редактировать заявку
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop table -->
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
              <span>📌</span> Тип заявки
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
          <!-- Fixed action column -->
          <th class="px-4 py-3 bg-white sticky right-0 z-10 text-xs text-gray-500 uppercase tracking-wider text-center">
            Действия
          </th>
        </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
        <tr
            v-for="app in applications"
            :key="app.id"
            :class="['transition-colors cursor-pointer',    {
                   'bg-green-100 hover:bg-green-200': app.is_fully_paid,
                   'hover:bg-gray-50': !app.is_fully_paid    }  ]"
            @dblclick="$emit('edit', app)"
        >
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
          <!-- Action button in fixed column -->
          <td class="px-4 py-4 whitespace-nowrap sticky right-0 bg-white text-right">
            <button
                @click.stop="$emit('edit', app)"
                class="text-blue-600 hover:text-blue-900 p-1.5 hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Редактировать заявку"
            >
              ✏️
            </button>
          </td>
        </tr>

        <!-- Empty state -->
        <tr v-if="applications.length === 0 && !loading">
          <td colspan="10" class="px-6 py-8 text-center text-gray-500">
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
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  applications: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  hasActiveFilters: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit'])

// Helper functions
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'новая': 'bg-blue-100 text-blue-800',
    'в работе': 'bg-yellow-100 text-yellow-800',
    'закрыта': 'bg-green-100 text-green-800'
  }

  return status ? statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'
}

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
</script>