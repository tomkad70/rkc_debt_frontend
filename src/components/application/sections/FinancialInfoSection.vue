<template>
  <FormSection title="Платежные документы" icon="💳">
    <!-- Индикатор загрузки -->
    <div v-if="isLoading" class="col-span-2 flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Только для роли бухгалтер -->
    <template v-else-if="currentUserRole === 'accountant'">
      <!-- Форма добавления платежного документа -->
      <div class="col-span-2 bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h4 class="text-sm font-semibold text-gray-700 mb-3 flex items-center">
          <span class="mr-2">➕</span>Добавить платежный документ
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormItem label="Номер платёжки">
            <input
                v-model="newDocument.payment_number"
                type="text"
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Введите номер"
                @keydown.enter.prevent="addPaymentDocument"
                :disabled="isSaving"
            />
          </FormItem>

          <FormItem label="Дата платёжки">
            <input
                v-model="newDocument.payment_date"
                type="date"
                class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                @keydown.enter.prevent="addPaymentDocument"
                :disabled="isSaving"
            />
          </FormItem>

          <FormItem label="Сумма платёжки">
            <div class="relative">
              <input
                  v-model.number="newDocument.payment_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full border border-gray-300 rounded-lg p-2.5 pr-6 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="0.00"
                  @keydown.enter="addPaymentDocument"
                  :disabled="isSaving"
              />
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span class="text-gray-500">₽</span>
              </div>
            </div>
          </FormItem>
        </div>

        <div class="mt-4 flex justify-end">
          <button
              @click.prevent="addPaymentDocument"
              :disabled="!isNewDocumentValid || isSaving"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white"
              :class="(isNewDocumentValid && !isSaving) ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200' : 'bg-gray-300 cursor-not-allowed'"
          >
            <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                 fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            {{ isSaving ? 'Сохранение...' : 'Добавить платёжку' }}
          </button>
        </div>
      </div>

      <!-- Таблица платежных документов -->
      <div class="col-span-2">
        <div class="overflow-x-auto rounded-lg border border-gray-200">
          <table class="w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сумма</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="paymentDocuments.length === 0">
              <td colspan="4" class="px-6 py-8 text-center">
                <div class="text-gray-500">
                  <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M9 14l6-6m-5.5.5h.01m4.99 4.99h.01M19 9l-7 7-5.5 5.5H5z"></path>
                  </svg>
                  <p class="mt-2 text-sm">Нет платежных документов</p>
                </div>
              </td>
            </tr>

            <tr v-else v-for="(doc, index) in paymentDocuments" :key="doc.id" class="hover:bg-gray-50">
              <!-- Номер платежки -->
              <td class="px-6 py-4 whitespace-nowrap">
                <template v-if="editingDocumentId === doc.id">
                  <input
                      v-model="editingDocument.payment_number"
                      type="text"
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      @keydown.enter="saveEdit"
                      @keydown.esc="cancelEdit"
                  />
                </template>
                <template v-else>
                  <span class="text-sm font-medium text-gray-900">{{ doc.payment_number }}</span>
                </template>
              </td>

              <!-- Дата платежки -->
              <td class="px-6 py-4 whitespace-nowrap">
                <template v-if="editingDocumentId === doc.id">
                  <input
                      v-model="editingDocument.payment_date"
                      type="date"
                      class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      @keydown.enter="saveEdit"
                      @keydown.esc="cancelEdit"
                  />
                </template>
                <template v-else>
                  <span class="text-sm text-gray-500">{{ formatDate(doc.payment_date) }}</span>
                </template>
              </td>

              <!-- Сумма платежки -->
              <td class="px-6 py-4 whitespace-nowrap">
                <template v-if="editingDocumentId === doc.id">
                  <div class="relative">
                    <input
                        v-model.number="editingDocument.payment_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        class="w-full px-2 py-1 pr-6 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        @keydown.enter="saveEdit"
                        @keydown.esc="cancelEdit"
                    />
                    <div class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <span class="text-gray-500 text-sm">₽</span>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <span class="text-sm text-gray-900">{{ formatPrice(doc.payment_amount) }}</span>
                </template>
              </td>

              <!-- Действия -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center space-x-3">
                  <!-- Кнопки редактирования -->
                  <template v-if="editingDocumentId === doc.id">
                    <button
                        @click.prevent="saveEdit"
                        :disabled="isSaving"
                        class="text-green-600 hover:text-green-900 inline-flex items-center"
                        :class="{ 'opacity-50 cursor-not-allowed': isSaving }"
                        title="Сохранить"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </button>
                    <button
                        @click.prevent="cancelEdit"
                        :disabled="isSaving"
                        class="text-gray-600 hover:text-gray-900 inline-flex items-center"
                        :class="{ 'opacity-50 cursor-not-allowed': isSaving }"
                        title="Отменить"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </template>
                  <!-- Кнопки по умолчанию -->
                  <template v-else>
                    <button
                        @click.prevent="startEdit(doc.id)"
                        :disabled="isSaving"
                        class="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        :class="{ 'opacity-50 cursor-not-allowed': isSaving }"
                        title="Редактировать"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                        @click.prevent="removePaymentDocument(doc.id)"
                        :disabled="isSaving"
                        class="text-red-600 hover:text-red-900 inline-flex items-center"
                        :class="{ 'opacity-50 cursor-not-allowed': isSaving }"
                        title="Удалить"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </template>
                </div>
              </td>
            </tr>

            <!-- Итоговая строка -->
            <tr class="bg-blue-50">
              <td colspan="2" class="px-6 py-4 text-sm font-bold text-gray-900">
                Всего оплачено:
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                {{ formatPrice(totalPaid) }}
              </td>
              <td class="px-6 py-4"></td>
            </tr>
            </tbody>
          </table>
        </div>

        <!-- Статус оплаты -->

        <div class="mt-4 flex items-center">
          <button
              type="button"
              @click="form.is_fully_paid = !form.is_fully_paid"
              class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              :class="form.is_fully_paid ? 'bg-blue-600' : 'bg-gray-200'"
          >
            <span
                class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="form.is_fully_paid ? 'translate-x-5' : 'translate-x-0'"/>
          </button>
          <span class="ml-2"
                :class="{ 'text-green-600 font-medium': form.is_fully_paid }">Заявка оплачена полностью</span>
        </div>
      </div>
    </template>

    <!-- Для других ролей - только просмотр -->
    <div v-else class="col-span-2">
      <p class="text-gray-500 text-sm">Для добавления платежных документов требуется роль бухгалтера.</p>
    </div>

    <!-- Уведомления -->
    <div v-if="notification.show"
         :class="['fixed bottom-4 right-4 p-4 rounded-lg shadow-lg', notification.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700']">
      {{ notification.message }}
    </div>
  </FormSection>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import {FormSection, FormItem} from '@/components/common/index.js'
import api from "@/../src/api.js";

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  currentUserRole: {
    type: String,
    required: true,
    default: 'accountant'
  }
})

// Состояние загрузки и сохранения
const isLoading = ref(false)
const isSaving = ref(false)

// Уведомления
const notification = ref({
  show: false,
  message: '',
  type: 'success'
})

// Новый платежный документ
const newDocument = ref({
  payment_number: '',
  payment_date: new Date().toISOString().split('T')[0],
  payment_amount: null
})

// Массив платежных документов
const paymentDocuments = ref([])

// Редактирование документа
const editingDocumentId = ref(null)
const editingDocument = ref({})

// Валидация нового документа
const isNewDocumentValid = computed(() => {
  return newDocument.value.payment_number &&
      newDocument.value.payment_date &&
      newDocument.value.payment_amount > 0
})

// Общая сумма оплаты
const totalPaid = computed(() => {
  return paymentDocuments.value.reduce((sum, doc) => sum + Number(doc.payment_amount), 0)
})

// Добавление платежного документа через API
const addPaymentDocument = async () => {
  if (!isNewDocumentValid.value || isSaving.value) return

  isSaving.value = true
  try {
    const response = await api.post(`/applications/${props.form.id}/payment-documents`, newDocument.value)

    paymentDocuments.value.push(response.data.payment_document)

    // Обновляем статус заявки
    props.form.is_fully_paid = response.data.application.is_fully_paid

    // Сброс формы
    newDocument.value = {
      payment_number: '',
      payment_date: new Date().toISOString().split('T')[0],
      payment_amount: null
    }

    showNotification('Платежный документ успешно добавлен', 'success')
  } catch (error) {
    console.error('Error adding payment document:', error)
    showNotification('Ошибка при добавлении платежного документа', 'error')
  } finally {
    isSaving.value = false
  }
}

// Удаление платежного документа через API
const removePaymentDocument = async (id) => {
  isSaving.value = true
  try {
    const response = await api.delete(`/payment-documents/${id}`)

    paymentDocuments.value = paymentDocuments.value.filter(doc => doc.id !== id)

    // Обновляем статус заявки
    props.form.is_fully_paid = response.data.application.is_fully_paid

    showNotification('Платежный документ успешно удален', 'success')
  } catch (error) {
    console.error('Error removing payment document:', error)
    showNotification('Ошибка при удалении платежного документа', 'error')
  } finally {
    isSaving.value = false
  }
}

// Начало редактирования
const startEdit = (id) => {
  const doc = paymentDocuments.value.find(d => d.id === id)
  if (doc) {
    editingDocumentId.value = id
    editingDocument.value = {...doc}
  }
}

// Сохранение редактирования через API
const saveEdit = async () => {
  if (!editingDocumentId.value || isSaving.value) return

  isSaving.value = true
  try {
    const response = await api.put(`/payment-documents/${editingDocumentId.value}`, editingDocument.value)

    const index = paymentDocuments.value.findIndex(doc => doc.id === editingDocumentId.value)
    if (index !== -1) {
      paymentDocuments.value[index] = response.data.payment_document
    }

    // Обновляем статус заявки
    props.form.is_fully_paid = response.data.application.is_fully_paid

    cancelEdit()
    showNotification('Платежный документ успешно обновлен', 'success')
  } catch (error) {
    console.error('Error updating payment document:', error)
    showNotification('Ошибка при обновлении платежного документа', 'error')
  } finally {
    isSaving.value = false
  }
}

// Отмена редактирования
const cancelEdit = () => {
  editingDocumentId.value = null
  editingDocument.value = {}
}

// Показать уведомление
const showNotification = (message, type = 'success') => {
  notification.value = {
    show: true,
    message,
    type
  }

  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

// Загрузка платежных документов при монтировании
onMounted(async () => {
  if (props.form.id) {
    await loadPaymentDocuments()
  }
})

// Загрузка платежных документов с сервера
const loadPaymentDocuments = async () => {
  isLoading.value = true
  try {
    const response = await api.get(`/applications/${props.form.id}/payment-documents`)
    paymentDocuments.value = response.data.payment_documents

    // Синхронизируем статус оплаты
    props.form.is_fully_paid = response.data.is_fully_paid
  } catch (error) {
    console.error('Error loading payment documents:', error)
    showNotification('Ошибка при загрузке платежных документов', 'error')
  } finally {
    isLoading.value = false
  }
}

// Форматирование даты
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// Форматирование цены
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00 ₽'
  return parseFloat(price).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' ₽'
}

// Эмиты для обновления родительского компонента
const emit = defineEmits(['update:payment-status'])

// Обновление статуса платежа для родительского компонента
watch(() => props.form.is_fully_paid, (newValue) => {
  emit('update:payment-status', newValue)
})
</script>