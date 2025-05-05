<template>
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm transition-opacity duration-300">
    <div @click.stop
         class="bg-white p-6 rounded-xl w-full max-w-4xl shadow-xl relative overflow-y-auto max-h-[90vh] animate-modal-appear">
      <!-- Modal Header -->
      <div class="border-b pb-4 mb-5">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-800">
            <span class="mr-2">📝</span>{{ form.id ? 'Редактировать заявку' : 'Новая заявка' }}
          </h2>
          <button @click="$emit('close')"
                  class="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-gray-500 text-sm mt-1">
          {{ form.id ? 'Обновление информации о заявке' : 'Создание новой заявки в системе' }}
        </p>
      </div>

      <form @submit.prevent="submit">
        <!-- Form Sections -->
        <div class="space-y-6">
          <!-- General Information -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <span class="mr-2">📋</span>Основная информация
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">📅 Дата заявки</label>
                <div class="relative">
                  <input v-model="form.application_date"
                         type="date"
                         class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">📌 Статус</label>
                <select v-model="form.status"
                        class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                  <option value="новая">🆕 Новая</option>
                  <option value="в работе">⚙️ В работе</option>
                  <option value="закрыта">✅ Закрыта</option>
                </select>
              </div>

              <!-- Организация - теперь как select для админа -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">🏢 Организация</label>
                <div class="relative">
                  <div v-if="isAdmin" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500">🏢</span>
                  </div>
                  <!-- Для админа показываем выпадающий список -->
                  <select v-if="isAdmin"
                          v-model="form.organization_id"
                          class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                    <option v-for="org in organizations" :key="org.id" :value="org.id">
                      {{ org.name }}
                    </option>
                  </select>
                  <!-- Для других пользователей показываем неактивное поле -->
                  <input v-else
                         :value="form.organization"
                         disabled
                         class="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-600">
                </div>
              </div>

              <!-- Юрист - теперь как select для админа -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">👨‍⚖ Юрист</label>
                <div class="relative">
                  <div v-if="isAdmin" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span class="text-gray-500">👨‍⚖</span>
                  </div>
                  <!-- Для админа показываем выпадающий список -->
                  <select v-if="isAdmin"
                          v-model="form.user_id"
                          class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                    <option v-for="user in lawyers" :key="user.id" :value="user.id">
                      {{ user.name }}
                    </option>
                  </select>
                  <!-- Для других пользователей показываем неактивное поле -->
                  <input v-else
                         :value="form.lawyer"
                         disabled
                         class="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-600">
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <span class="mr-2">📎</span>Документы
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <input type="checkbox"
                         v-model="form.has_signature"
                         class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer">
                  Подпись заказчика
                </label>
              </div>

              <div class="space-y-2">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <input type="checkbox"
                         v-model="form.has_documents"
                         class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer">
                  Документы предоставлены
                </label>
              </div>

              <div class="sm:col-span-2 space-y-2">
                <label class="block text-sm font-medium text-gray-700">📝 Примечание к документам</label>
                <textarea v-model="form.documents_note"
                          class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[80px]"
                          placeholder="Укажите примечания к документам..."></textarea>
              </div>
            </div>
          </div>

          <!-- Debtor Information -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <span class="mr-2">👤</span>Информация о должнике
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">ФИО должника</label>
                <input v-model="form.debtor_name"
                       type="text"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       placeholder="Введите ФИО должника">
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">🏠 Адрес должника</label>
                <input v-model="form.debtor_address"
                       type="text"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       placeholder="Введите адрес должника">
              </div>
            </div>
          </div>

          <!-- Court Information -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <span class="mr-2">⚖</span>Судебная информация
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <input type="checkbox"
                         v-model="form.is_in_court"
                         class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer">
                  Подали в суд
                </label>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">📂 Текущее действие</label>
                <select v-model="form.action_type"
                        class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
                  <option value="">Не выбрано</option>
                  <option value="Судебный приказ">Судебный приказ</option>
                  <option value="Исковое производство">Исковое производство</option>
                </select>
              </div>

              <div class="space-y-2">
                <label class="flex items-center text-sm font-medium text-gray-700">
                  <input type="checkbox"
                         v-model="form.ufssp_sent"
                         class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer">
                  УФССП передано
                </label>
              </div>

              <div class="sm:col-span-1 space-y-2">
                <label class="block text-sm font-medium text-gray-700">📑 № производства</label>
                <input v-model="form.execution_number"
                       type="text"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       placeholder="Введите номер производства">
              </div>

              <div class="sm:col-span-1 space-y-2">
                <label class="block text-sm font-medium text-gray-700">📅 Дата производства</label>
                <input v-model="form.execution_date"
                       type="date"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">⚖ № судебного дела</label>
                <input v-model="form.court_case_number"
                       type="text"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       placeholder="Введите номер судебного дела">
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">📅 Дата судебного дела</label>
                <input v-model="form.court_case_date"
                       type="date"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
              </div>

              <div class="sm:col-span-2 space-y-2">
                <label class="block text-sm font-medium text-gray-700">📜 Решение суда</label>
                <textarea v-model="form.court_decision"
                          class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[80px]"
                          placeholder="Введите решение суда..."></textarea>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">📅 Дата решения суда</label>
                <input v-model="form.court_decision_date"
                       type="date"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">📅 Дата судебного приказа</label>
                <input v-model="form.court_order_date"
                       type="date"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer">
              </div>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-md font-semibold text-gray-700 mb-3 flex items-center">
              <span class="mr-2">💰</span>Финансовая информация
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">💸 № платежки</label>
                <input v-model="form.payment_number"
                       type="text"
                       class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                       placeholder="Введите номер платежки">
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">💰 Сумма платежки</label>
                <div class="relative">
                  <input v-model="form.payment_sum"
                         type="number"
                         step="0.01"
                         class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                         placeholder="0.00">
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-gray-500">₽</span>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700">🧾 Итоговая стоимость</label>
                <div class="relative">
                  <input v-model="form.total_cost"
                         type="number"
                         step="0.01"
                         class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
                         placeholder="0.00">
                  <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span class="text-gray-500">₽</span>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <label class="flex items-center h-full text-sm font-medium text-gray-700 mt-6">
                  <input type="checkbox"
                         v-model="form.is_executed"
                         class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer">
                  Заявка исполнена
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-6 flex justify-end space-x-3 border-t pt-4">
          <button @click.prevent="$emit('close')"
                  type="button"
                  class="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer">
            Отмена
          </button>
          <button type="submit"
                  class="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
            <span class="flex items-center justify-center">
              <span class="mr-2">💾</span>
              {{ form.id ? 'Сохранить изменения' : 'Создать заявку' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import api from '../api'

const props = defineProps({ application: Object })
const emit = defineEmits(['close', 'updated'])

// Добавляем необходимые состояния для списков организаций и юристов
const organizations = ref([])
const users = ref([])
const loading = ref(false)

// Получаем роль пользователя
const userRole = localStorage.getItem('role')
const isAdmin = computed(() => userRole === 'admin')

// Отфильтрованные пользователи только с ролью "lawyer"
const lawyers = computed(() => {
  return users.value.filter(user => user.roles && user.roles.includes('lawyer'))
})

// Создаем реактивную копию переданного объекта заявки
const form = reactive({
  ...(props.application || {})
})

// Отладочный вывод, чтобы понять структуру данных
console.log('Props application:', props.application);
console.log('Form initial state:', form);

// Загрузка необходимых данных для выпадающих списков
const loadData = async () => {
  loading.value = true
  try {
    const [orgsRes, usersRes] = await Promise.all([
      api.get('/organizations'),
      api.get('/users')
    ])
    organizations.value = orgsRes.data.data || orgsRes.data
    users.value = usersRes.data.data || usersRes.data

    console.log('Organizations loaded:', organizations.value.length)
    console.log('Users loaded:', users.value.length)

    // Если это новая заявка и администратор - установим организацию и юриста по умолчанию
    if (!form.id && organizations.value.length > 0 && !form.organization_id) {
      form.organization_id = organizations.value[0].id
    }

    if (!form.id && lawyers.value.length > 0 && !form.user_id) {
      form.user_id = lawyers.value[0].id
    }

    // Выводим для отладки
    console.log('Form after setting defaults:', {
      organization_id: form.organization_id,
      user_id: form.user_id
    })
  } catch (error) {
    console.error('Failed to load form data:', error)
  } finally {
    loading.value = false
  }
}

// Преобразуем строковые ID в числовые при необходимости
const normalizeIds = () => {
  // Проверяем, есть ли у нас ID в виде строк, и конвертируем их в числа при необходимости
  if (form.organization_id && typeof form.organization_id === 'string') {
    form.organization_id = parseInt(form.organization_id, 10)
  }

  if (form.user_id && typeof form.user_id === 'string') {
    form.user_id = parseInt(form.user_id, 10)
  }
}

const submit = async () => {
  try {
    normalizeIds()

    const method = form.id ? 'put' : 'post'
    const url = form.id ? `/applications/${form.id}` : '/applications'

    console.log('Submitting form data:', form)

    await api[method](url, form)
    emit('updated')
    emit('close')
  } catch (err) {
    console.error('Error saving application:', err)
    alert('Ошибка при сохранении заявки')
  }
}

// Наблюдаем за изменениями props.application и обновляем форму
watch(() => props.application, (newVal) => {
  if (newVal) {
    Object.assign(form, newVal)
    console.log('Form updated from props:', form)
  }
}, { immediate: true, deep: true })

// Загружаем данные при монтировании компонента
onMounted(async () => {
  await loadData()
  normalizeIds()
})
</script>

<style scoped>
.animate-modal-appear {
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure number inputs don't show spin buttons */
input[type=number]::-webkit-inner-spin-button,
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
}
</style>