<template>
  <FormSection title="Состав и стоимость услуг" icon="📋">
    <div class="sm:col-span-2">
      <!-- Header с кнопкой добавления и суммами -->
      <div class="flex justify-between items-center mb-3">
        <div>
          <h4 class="text-sm font-medium text-gray-600">
            {{ applicationServices.length > 0 ? `Добавлено услуг: ${applicationServices.length}` : 'Нет добавленных услуг' }}
          </h4>
          <div v-if="applicationServices.length > 0" class="mt-1 text-xs text-gray-500">
            Сумма: Юрист {{ formatPrice(totalLawyerPrice) }} | РКЦ {{ formatPrice(totalPartnerPrice) }}
          </div>
        </div>
        <button
            v-if="canEditServices"
            @click.prevent="showAddForm = !showAddForm"
            type="button"
            class="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
        >
          <span class="mr-1">{{ showAddForm ? 'Скрыть форму' : 'Добавить услугу' }}</span>
          <span>{{ showAddForm ? '↑' : '+' }}</span>
        </button>
      </div>

      <!-- Форма добавления/редактирования услуги (показывается только при необходимости) -->
      <div v-if="(showAddForm || editingIndex !== null) && canEditServices" class="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100 animate-slide-down">
        <h4 class="font-medium text-gray-700 mb-3 flex items-center">
          <span class="mr-2">{{ editingIndex !== null ? '✏️' : '➕' }}</span>
          {{ editingIndex !== null ? 'Редактирование услуги' : 'Добавление услуги' }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-3">
            <label class="block text-sm font-medium text-gray-700 mb-1">Наименование услуги</label>
            <div class="flex">
              <select
                  v-model="currentService.service_id"
                  class="flex-grow border border-gray-300 rounded-l-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  @change="handleServiceSelect"
              >
                <option value="">-- Выберите услугу --</option>
                <option v-for="service in availableServices" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
                <option value="new" class="font-medium text-blue-600">+ Добавить новую услугу</option>
              </select>
            </div>
          </div>

          <!-- Форма создания новой услуги -->
          <div v-if="currentService.service_id === 'new'" class="sm:col-span-3 p-3 bg-white rounded-lg border border-blue-200 mb-2 animate-slide-down">
            <label class="block text-sm font-medium text-gray-700 mb-1">Название новой услуги</label>
            <div class="flex">
              <input
                  v-model="newServiceName"
                  type="text"
                  class="flex-grow border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Введите название новой услуги"
                  ref="newServiceInput"
              />
              <button
                  @click.prevent="createNewService"
                  type="button"
                  :disabled="!newServiceName.trim()"
                  class="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать
              </button>
              <button
                  @click.prevent="currentService.service_id = ''"
                  type="button"
                  class="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Цена Юриста (₽)</label>
            <div class="relative">
              <input
                  v-model="currentService.lawyer_price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500">₽</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Цена РКЦ (₽)</label>
            <div class="relative">
              <input
                  v-model="currentService.partner_price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500">₽</span>
              </div>
            </div>
          </div>

          <div class="sm:col-span-3 flex justify-end space-x-2 mt-2">
            <button
                @click.prevent="cancelEdit"
                type="button"
                class="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
                @click.prevent="saveService"
                type="button"
                :disabled="!isServiceFormValid"
                class="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ editingIndex !== null ? 'Сохранить изменения' : 'Добавить услугу' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Таблица услуг -->
      <div v-if="applicationServices.length > 0" class="overflow-x-auto bg-white rounded-lg border">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Наименование
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Цена Юриста (₽)
            </th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Цена РКЦ (₽)
            </th>
            <th v-if="canEditServices" scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Действия
            </th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(service, index) in applicationServices"
              :key="index"
              class="hover:bg-gray-50"
              :class="{'bg-blue-50': editingIndex === index}">
            <td class="px-4 py-3 text-sm text-gray-900">
              {{ service.name }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 text-right">
              {{ formatPrice(service.lawyer_price) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-900 text-right">
              {{ formatPrice(service.partner_price) }}
            </td>
            <td v-if="canEditServices" class="px-4 py-3 text-right text-sm whitespace-nowrap">
              <button
                  @click.prevent="editService(index)"
                  type="button"
                  class="text-indigo-600 hover:text-indigo-900 mr-2 p-1 hover:bg-indigo-50 rounded"
                  title="Редактировать"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                  @click.prevent="openDeleteConfirm(index)"
                  type="button"
                  class="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                  title="Удалить"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
          </tbody>
          <!-- Итоговая строка -->
          <tfoot class="bg-gray-50">
          <tr>
            <td class="px-4 py-3 text-sm font-medium text-gray-700">Итого:</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-700 text-right">
              {{ formatPrice(totalLawyerPrice) }}
            </td>
            <td class="px-4 py-3 text-sm font-medium text-gray-700 text-right">
              {{ formatPrice(totalPartnerPrice) }}
            </td>
            <td v-if="canEditServices"></td>
          </tr>
          </tfoot>
        </table>
      </div>

      <!-- Пустое состояние (когда нет услуг и форма скрыта) -->
      <div
          v-if="applicationServices.length === 0 && !showAddForm"
          class="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center"
      >
        <div class="text-gray-400 mb-2 text-3xl">📋</div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">Услуги не добавлены</h3>
        <p class="text-gray-500 mb-4">Добавьте услуги юриста для этой заявки</p>
        <button
            v-if="canEditServices"
            @click.prevent="showAddForm = true"
            type="button"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
        >
          Добавить услугу
        </button>
      </div>

      <!-- Модальное окно подтверждения удаления -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="fixed inset-0 bg-black opacity-50" @click.prevent="showDeleteConfirm = false"></div>
        <div class="bg-white rounded-lg p-6 w-full max-w-md z-10 relative shadow-xl">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Подтверждение удаления</h3>
          <p class="text-gray-600 mb-4">
            Вы действительно хотите удалить услугу "<span class="font-medium">{{ deleteItem ? deleteItem.name : '' }}</span>"?
          </p>
          <div class="flex justify-end space-x-3">
            <button
                @click.prevent="showDeleteConfirm = false"
                type="button"
                class="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
                @click.prevent="confirmDelete"
                type="button"
                class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  </FormSection>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import FormSection from '@/components/common/FormSection.vue'
import api from '@/api'

const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:totalCost'])

// Получение роли пользователя
const userRole = localStorage.getItem('role')
const isAdmin = computed(() => userRole === 'admin')
const isLawyer = computed(() => userRole === 'lawyer')
const isAccountant = computed(() => userRole === 'accountant')

// Проверка прав на редактирование услуг (только для админов и юристов)
const canEditServices = computed(() => isAdmin.value || isLawyer.value)

// Список услуг заявки
const applicationServices = ref([])

// Доступные услуги из справочника
const availableServices = ref([])

// Индекс редактируемой услуги
const editingIndex = ref(null)

// Показывать форму добавления
const showAddForm = ref(false)

// Показывать подтверждение удаления
const showDeleteConfirm = ref(false)

// Элемент для удаления
const deleteItem = ref(null)
const deleteIndex = ref(null)

// Текущая редактируемая услуга
const currentService = reactive({
  service_id: '',
  name: '',
  lawyer_price: '',
  partner_price: ''
})

// Название новой услуги
const newServiceName = ref('')

// Ссылка на поле ввода новой услуги для фокуса
const newServiceInput = ref(null)

// Вычисляем общую стоимость услуг юриста
const totalLawyerPrice = computed(() => {
  return applicationServices.value.reduce((sum, service) => {
    return sum + (Number(service.lawyer_price) || 0)
  }, 0)
})

// Вычисляем общую стоимость услуг посредника
const totalPartnerPrice = computed(() => {
  return applicationServices.value.reduce((sum, service) => {
    return sum + (Number(service.partner_price) || 0)
  }, 0)
})

// Вычисляем общую стоимость всех услуг (сумма юриста + посредника)
const totalServicesPrice = computed(() => {
  return totalLawyerPrice.value + totalPartnerPrice.value
})

// Валидация формы услуги
const isServiceFormValid = computed(() => {
  if (currentService.service_id === 'new') {
    return newServiceName.value.trim() &&
        Number(currentService.lawyer_price) >= 0 &&
        Number(currentService.partner_price) >= 0
  } else {
    return (currentService.service_id || currentService.name.trim()) &&
        Number(currentService.lawyer_price) >= 0 &&
        Number(currentService.partner_price) >= 0
  }
})

// Загрузка доступных услуг
const loadServices = async () => {
  try {
    const response = await api.get('/application-services')
    availableServices.value = response.data.data || response.data
  } catch (error) {
    console.error('Ошибка при загрузке услуг:', error)
  }
}

// Загрузка услуг заявки
const loadApplicationServices = () => {
  if (props.form.services && Array.isArray(props.form.services)) {
    applicationServices.value = [...props.form.services]
  } else {
    applicationServices.value = []
  }
}

// Создание новой услуги в справочнике
const createNewService = async () => {
  if (!newServiceName.value.trim()) return

  try {
    const response = await api.post('/application-services', {
      name: newServiceName.value.trim(),
      lawyer_price: Number(currentService.lawyer_price) || 0,
      partner_price: Number(currentService.partner_price) || 0
    })

    const newService = response.data.data || response.data
    availableServices.value.push(newService)

    // Выбираем созданную услугу
    currentService.service_id = newService.id
    currentService.name = newService.name

    // Сбрасываем поле
    newServiceName.value = ''

  } catch (error) {
    console.error('Ошибка при создании услуги:', error)
    alert('Не удалось создать услугу')
  }
}

// Обработчик выбора услуги из списка
const handleServiceSelect = () => {
  if (currentService.service_id === '') {
    currentService.name = ''
    return
  }

  if (currentService.service_id === 'new') {
    currentService.name = ''
    // Фокус на поле ввода новой услуги
    nextTick(() => {
      if (newServiceInput.value) {
        newServiceInput.value.focus()
      }
    })
    return
  }

  const selectedService = availableServices.value.find(service => service.id == currentService.service_id)
  if (selectedService) {
    currentService.name = selectedService.name
    // Если есть базовые цены в справочнике, используем их как значения по умолчанию
    currentService.lawyer_price = selectedService.lawyer_price || ''
    currentService.partner_price = selectedService.partner_price || ''
  }
}

// Редактирование услуги
const editService = (index) => {
  const service = applicationServices.value[index]

  currentService.service_id = service.service_id || service.id || ''
  currentService.name = service.name || ''
  currentService.lawyer_price = service.lawyer_price || ''
  currentService.partner_price = service.partner_price || ''

  editingIndex.value = index
  showAddForm.value = true

  // Прокрутка к форме редактирования
  nextTick(() => {
    document.querySelector('.bg-blue-50')?.scrollIntoView({behavior: 'smooth', block: 'center'})
  })
}

// Отмена редактирования
const cancelEdit = () => {
  editingIndex.value = null
  showAddForm.value = false
  resetForm()
}

// Сброс формы
const resetForm = () => {
  currentService.service_id = ''
  currentService.name = ''
  currentService.lawyer_price = ''
  currentService.partner_price = ''
  newServiceName.value = ''
}

// Открытие диалога подтверждения удаления
const openDeleteConfirm = (index) => {
  deleteItem.value = applicationServices.value[index]
  deleteIndex.value = index
  showDeleteConfirm.value = true
}

// Подтверждение удаления
const confirmDelete = () => {
  if (deleteIndex.value !== null) {
    applicationServices.value.splice(deleteIndex.value, 1)
    updateFormServices()
    showDeleteConfirm.value = false
    deleteItem.value = null
    deleteIndex.value = null
  }
}

// Сохранение услуги
const saveService = () => {
  if (!isServiceFormValid.value) return

  const serviceToSave = {
    service_id: currentService.service_id === 'new' ? '' : currentService.service_id,
    name: currentService.service_id === 'new' ? newServiceName.value : currentService.name,
    lawyer_price: Number(currentService.lawyer_price) || 0,
    partner_price: Number(currentService.partner_price) || 0,
  }

  if (editingIndex.value !== null) {
    // Обновляем существующую услугу
    applicationServices.value.splice(editingIndex.value, 1, serviceToSave)
    editingIndex.value = null
  } else {
    // Добавляем новую услугу
    applicationServices.value.push(serviceToSave)
  }

  updateFormServices()
  resetForm()
  showAddForm.value = false
}

// Обновление услуг в форме заявки
const updateFormServices = () => {
  props.form.services = [...applicationServices.value]

  // Обновляем общую стоимость в форме
  if (props.form.total_cost === undefined || props.form.total_cost === null || props.form.total_cost === '') {
    props.form.total_cost = totalServicesPrice.value
  }

  // Сообщаем родителю об изменении суммы
  emit('update:totalCost', totalServicesPrice.value)
}

// Форматирование цены
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00 ₽';
  return parseFloat(price).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' ₽';
}

// Наблюдаем за изменениями в форме
watch(() => props.form, (newVal) => {
  if (newVal) {
    loadApplicationServices()
  }
}, {immediate: true, deep: true})

// Наблюдаем за изменениями в списке услуг для обновления итоговой суммы
watch([totalLawyerPrice, totalPartnerPrice], () => {
  // Обновляем родительский компонент с новой суммой
  emit('update:totalCost', totalServicesPrice.value)
}, {immediate: true})

// Инициализация
onMounted(async () => {
  await loadServices()
  loadApplicationServices()
})
</script>

<style scoped>
.animate-slide-down {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>