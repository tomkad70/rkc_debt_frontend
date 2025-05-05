<template>
  <FormSection title="Этапы заявки" icon="🔄">
    <div class="sm:col-span-2">
      <!-- Header с кнопкой добавления -->
      <div class="flex justify-between items-center mb-3">
        <h4 class="text-sm font-medium text-gray-600">
          {{ applicationSteps.length > 0 ? `Добавлено этапов: ${applicationSteps.length}` : 'Нет добавленных этапов' }}
        </h4>
        <button
            v-if="canEditSteps"
            @click.prevent="showAddForm = !showAddForm"
            type="button"
            class="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
        >
          <span class="mr-1">{{ showAddForm ? 'Скрыть форму' : 'Добавить этап' }}</span>
          <span>{{ showAddForm ? '↑' : '+' }}</span>
        </button>
      </div>

      <!-- Форма добавления/редактирования этапа -->
      <div v-if="(showAddForm || editingIndex !== null) && canEditSteps" class="bg-green-50 p-4 rounded-lg mb-4 border border-green-100 animate-slide-down">
        <h4 class="font-medium text-gray-700 mb-3 flex items-center">
          <span class="mr-2">{{ editingIndex !== null ? '✏️' : '➕' }}</span>
          {{ editingIndex !== null ? 'Редактирование этапа' : 'Добавление этапа' }}
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Наименование этапа</label>
            <div class="flex">
              <select
                  v-model="currentStep.step_id"
                  class="flex-grow border border-gray-300 rounded-l-lg p-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  @change="handleStepSelect"
              >
                <option value="">-- Выберите этап --</option>
                <option v-for="step in availableSteps" :key="step.id" :value="step.id">
                  {{ step.name }}
                </option>
                <option value="new" class="font-medium text-green-600">+ Добавить новый этап</option>
              </select>
            </div>
          </div>

          <!-- Форма создания нового этапа -->
          <div v-if="currentStep.step_id === 'new'" class="sm:col-span-2 p-3 bg-white rounded-lg border border-green-200 mb-2 animate-slide-down">
            <label class="block text-sm font-medium text-gray-700 mb-1">Название нового этапа</label>
            <div class="flex">
              <input
                  v-model="newStepName"
                  type="text"
                  class="flex-grow border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  placeholder="Введите название нового этапа"
                  ref="newStepInput"
              />
              <button
                  @click.prevent="createNewStep"
                  :disabled="!newStepName.trim()"
                  class="ml-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать
              </button>
              <button
                  @click.prevent="currentStep.step_id = ''"
                  class="ml-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>

          <div class="sm:col-span-1">
            <label class="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input
                v-model="currentStep.step_date"
                type="date"
                class="w-full border border-gray-300 rounded-lg p-2 focus:ring-green-500 focus:border-green-500 outline-none cursor-pointer"
            />
          </div>

          <div class="sm:col-span-2 flex justify-end space-x-2 mt-2">
            <button
                @click.prevent="cancelEdit"
                type="button"
                class="px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
                @click.prevent="saveStep"
                type="button"
                :disabled="!isStepFormValid"
                class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ editingIndex !== null ? 'Сохранить изменения' : 'Добавить этап' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Время исторической линии (только если есть этапы) -->
      <div v-if="applicationSteps.length > 0" class="relative mb-5">
        <!-- Стрелки для перемещения по линии времени -->
        <div v-if="applicationSteps.length > 3" class="flex justify-between mb-1">
          <button
              @click.prevent="scrollTimeline('left')"
              class="text-gray-600 hover:text-gray-900 p-1"
              :disabled="timelineScrollPosition <= 0"
              :class="{'opacity-50 cursor-not-allowed': timelineScrollPosition <= 0}"
          >
            <span>⬅️</span>
          </button>
          <button
              @click.prevent="scrollTimeline('right')"
              class="text-gray-600 hover:text-gray-900 p-1"
              :disabled="timelineScrollPosition >= 100"
              :class="{'opacity-50 cursor-not-allowed': timelineScrollPosition >= 100}"
          >
            <span>➡️</span>
          </button>
        </div>

        <!-- Линия времени -->
        <div class="overflow-x-auto pb-2" ref="timelineRef">
          <div class="flex space-x-3 min-w-max">
            <div
                v-for="(step, index) in sortedSteps"
                :key="index"
                class="flex flex-col items-center"
            >
              <div
                  class="w-32 p-2 bg-white border rounded-lg shadow-sm text-center text-sm cursor-pointer hover:bg-gray-50"
                  :class="{'border-green-500 ring-2 ring-green-100': editingIndex === getOriginalIndex(step)}"
                  @click.prevent="canEditSteps ? editStep(getOriginalIndex(step)) : null"
              >
                <div class="font-medium text-gray-800 truncate w-full mb-1" :title="step.name">
                  {{ step.name }}
                </div>
                <div class="text-gray-600 text-xs">
                  {{ formatDate(step.step_date) }}
                </div>
              </div>

              <!-- Соединительная линия -->
              <div class="h-4 w-0.5 bg-gray-300"></div>
            </div>
          </div>
          <!-- Горизонтальная линия -->
          <div class="h-0.5 bg-gray-300 w-full mt-0"></div>
        </div>
      </div>

      <!-- Таблица этапов -->
      <div v-if="applicationSteps.length > 0" class="overflow-x-auto bg-white rounded-lg border">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Дата
            </th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Наименование этапа
            </th>
            <th v-if="canEditSteps" scope="col" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
              Действия
            </th>
          </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(step, index) in applicationSteps"
              :key="index"
              class="hover:bg-gray-50"
              :class="{'bg-green-50': editingIndex === index}">
            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
              {{ formatDate(step.step_date) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">
              {{ step.name }}
            </td>
            <td v-if="canEditSteps" class="px-4 py-3 text-right text-sm whitespace-nowrap">
              <!-- Кнопка редактирования в таблице -->
              <button
                  @click.prevent="editStep(index)"
                  type="button"
                  class="text-indigo-600 hover:text-indigo-900 mr-2 p-1 hover:bg-indigo-50 rounded"
                  title="Редактировать"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <!-- Кнопка удаления в таблице -->
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
        </table>
      </div>

      <!-- Пустое состояние (когда нет этапов и форма скрыта) -->
      <div
          v-if="applicationSteps.length === 0 && !showAddForm"
          class="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center"
      >
        <div class="text-gray-400 mb-2 text-3xl">🔄</div>
        <h3 class="text-lg font-medium text-gray-700 mb-1">Этапы не добавлены</h3>
        <p class="text-gray-500 mb-4">Добавьте этапы обработки заявки</p>
        <button
            v-if="canEditSteps"
            @click.prevent="showAddForm = true"
            type="button"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
        >
          Добавить этап
        </button>
      </div>

      <!-- Модальное окно подтверждения удаления -->
      <div v-if="showDeleteConfirm" class="fixed inset-0 flex items-center justify-center z-50">
        <div class="fixed inset-0 bg-black opacity-50" @click.prevent="showDeleteConfirm = false"></div>
        <div class="bg-white rounded-lg p-6 w-full max-w-md z-10 relative shadow-xl">
          <h3 class="text-lg font-medium text-gray-900 mb-3">Подтверждение удаления</h3>
          <p class="text-gray-600 mb-4">
            Вы действительно хотите удалить этап "<span class="font-medium">{{ deleteItem ? deleteItem.name : '' }}</span>"?
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

// Получение роли пользователя
const userRole = localStorage.getItem('role')
const isAdmin = computed(() => userRole === 'admin')
const isLawyer = computed(() => userRole === 'lawyer')

// Проверка прав на редактирование этапов (только админы и юристы)
const canEditSteps = computed(() => isAdmin.value || isLawyer.value)

// Список этапов заявки
const applicationSteps = ref([])

// Доступные этапы из справочника
const availableSteps = ref([])

// Индекс редактируемого этапа
const editingIndex = ref(null)

// Показывать форму добавления
const showAddForm = ref(false)

// Показывать подтверждение удаления
const showDeleteConfirm = ref(false)

// Элемент для удаления
const deleteItem = ref(null)
const deleteIndex = ref(null)

// Текущий редактируемый этап
const currentStep = reactive({
  step_id: '',
  name: '',
  step_date: new Date().toISOString().split('T')[0] // Текущая дата по умолчанию
})

// Название нового этапа
const newStepName = ref('')

// Ссылка на поле ввода нового этапа для фокуса
const newStepInput = ref(null)

// Ссылка на элемент временной шкалы
const timelineRef = ref(null)

// Позиция прокрутки временной шкалы (0-100%)
const timelineScrollPosition = ref(0)

// Сортированные по дате этапы для временной шкалы
const sortedSteps = computed(() => {
  return [...applicationSteps.value].sort((a, b) => {
    return new Date(a.step_date) - new Date(b.step_date)
  })
})

// Получение оригинального индекса отсортированного этапа
const getOriginalIndex = (step) => {
  return applicationSteps.value.findIndex(s =>
      s.step_id === step.step_id &&
      s.name === step.name &&
      s.step_date === step.step_date
  )
}

// Прокрутка временной шкалы
const scrollTimeline = (direction) => {
  if (!timelineRef.value) return

  const scrollAmount = timelineRef.value.clientWidth * 0.8
  const currentScroll = timelineRef.value.scrollLeft
  const maxScroll = timelineRef.value.scrollWidth - timelineRef.value.clientWidth

  if (direction === 'right') {
    timelineRef.value.scrollTo({
      left: Math.min(currentScroll + scrollAmount, maxScroll),
      behavior: 'smooth'
    })
  } else {
    timelineRef.value.scrollTo({
      left: Math.max(currentScroll - scrollAmount, 0),
      behavior: 'smooth'
    })
  }

  // Обновляем позицию прокрутки
  setTimeout(() => {
    if (timelineRef.value) {
      timelineScrollPosition.value = (timelineRef.value.scrollLeft / maxScroll) * 100
    }
  }, 300)
}

// Валидация формы этапа
const isStepFormValid = computed(() => {
  if (currentStep.step_id === 'new') {
    return newStepName.value.trim() && currentStep.step_date
  } else {
    return (currentStep.step_id || currentStep.name.trim()) && currentStep.step_date
  }
})

// Загрузка доступных этапов
const loadSteps = async () => {
  try {
    const response = await api.get('/application-steps')
    availableSteps.value = response.data.data || response.data
  } catch (error) {
    console.error('Ошибка при загрузке этапов:', error)
  }
}

// Загрузка этапов заявки
const loadApplicationSteps = () => {
  if (props.form.steps && Array.isArray(props.form.steps)) {
    // Убедимся, что все этапы имеют поле step_date
    applicationSteps.value = props.form.steps.map(step => {
      // Если в данных используется date вместо step_date, преобразуем
      if (step.date && !step.step_date) {
        return {
          ...step,
          step_date: step.date
        }
      }
      return step;
    })
  } else {
    applicationSteps.value = []
  }
}

// Создание нового этапа в справочнике
const createNewStep = async () => {
  if (!newStepName.value.trim()) return

  try {
    const response = await api.post('/application-steps', {
      name: newStepName.value.trim()
    })

    const newStep = response.data.data || response.data
    availableSteps.value.push(newStep)

    // Выбираем созданный этап
    currentStep.step_id = newStep.id
    currentStep.name = newStep.name

    // Сбрасываем поле
    newStepName.value = ''

  } catch (error) {
    console.error('Ошибка при создании этапа:', error)
    alert('Не удалось создать этап')
  }
}

// Обработчик выбора этапа из списка
const handleStepSelect = () => {
  if (currentStep.step_id === '') {
    currentStep.name = ''
    return
  }

  if (currentStep.step_id === 'new') {
    currentStep.name = ''
    // Фокус на поле ввода нового этапа
    nextTick(() => {
      if (newStepInput.value) {
        newStepInput.value.focus()
      }
    })
    return
  }

  const selectedStep = availableSteps.value.find(step => step.id == currentStep.step_id)
  if (selectedStep) {
    currentStep.name = selectedStep.name
  }
}

// Редактирование этапа
const editStep = (index) => {
  if (!canEditSteps.value) return;

  const step = applicationSteps.value[index]

  currentStep.step_id = step.step_id || step.id || ''
  currentStep.name = step.name || ''

  // Корректируем формат даты
  let stepDate = step.step_date || step.date || new Date().toISOString().split('T')[0]
  // Если дата в формате с временем (yyyy-MM-dd HH:mm:ss), извлекаем только дату
  if (stepDate.includes(' ')) {
    stepDate = stepDate.split(' ')[0]
  }
  currentStep.step_date = stepDate

  editingIndex.value = index
  showAddForm.value = true

  // Прокрутка к форме редактирования
  nextTick(() => {
    document.querySelector('.bg-green-50')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
  currentStep.step_id = ''
  currentStep.name = ''
  currentStep.step_date = new Date().toISOString().split('T')[0]
  newStepName.value = ''
}

// Открытие диалога подтверждения удаления
const openDeleteConfirm = (index) => {
  deleteItem.value = applicationSteps.value[index]
  deleteIndex.value = index
  showDeleteConfirm.value = true
}

// Подтверждение удаления
const confirmDelete = () => {
  if (deleteIndex.value !== null) {
    applicationSteps.value.splice(deleteIndex.value, 1)
    updateFormSteps()
    showDeleteConfirm.value = false
    deleteItem.value = null
    deleteIndex.value = null
  }
}

// Сохранение этапа
const saveStep = () => {
  if (!isStepFormValid.value) return

  const stepToSave = {
    step_id: currentStep.step_id === 'new' ? '' : currentStep.step_id,
    name: currentStep.step_id === 'new' ? newStepName.value : currentStep.name,
    step_date: currentStep.step_date
  }

  if (editingIndex.value !== null) {
    // Обновляем существующий этап
    applicationSteps.value.splice(editingIndex.value, 1, stepToSave)
    editingIndex.value = null
  } else {
    // Добавляем новый этап
    applicationSteps.value.push(stepToSave)
  }

  updateFormSteps()
  resetForm()
  showAddForm.value = false
}

// Обновление этапов в форме заявки
const updateFormSteps = () => {
  props.form.steps = [...applicationSteps.value]
}

// Форматирование даты
const formatDate = (dateString) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString

  return date.toLocaleDateString('ru-RU')
}

// Наблюдаем за изменениями в форме
watch(() => props.form, (newVal) => {
  if (newVal) {
    loadApplicationSteps()
  }
}, { immediate: true, deep: true })

// Инициализация
onMounted(async () => {
  await loadSteps()
  loadApplicationSteps()
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