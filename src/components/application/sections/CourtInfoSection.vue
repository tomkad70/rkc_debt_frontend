<template>
  <FormSection title="Судебная информация" icon="⚖">
    <!-- Блок "Подали в суд" с полями -->
    <FormItem label="Подали в суд" isCheckbox>
      <template #checkbox>
        <input
            type="checkbox"
            v-model="isInCourt"
            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer"
        />
      </template>
    </FormItem>

    <!-- Поля, связанные с судом, с отступом для группировки -->
    <div class="ml-6 mt-2" :class="{'opacity-50': !isInCourt}">
      <FormItem label="📂 Текущее действие">
        <select
            v-model="form.action_type"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            :disabled="!isInCourt"
        >
          <option value="">Не выбрано</option>
          <option value="Судебный приказ">Судебный приказ</option>
          <option value="Исковое производство">Исковое производство</option>
        </select>
      </FormItem>

      <FormItem label="⚖ № судебного дела">

        <input
            v-model="form.court_case_number"
            type="text"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="Введите номер судебного дела"
            :disabled="!isInCourt"
        />
      </FormItem>

      <FormItem label="📅 Дата судебного дела">
        <input
            v-model="form.court_case_date"
            type="date"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            :disabled="!isInCourt"
        />
      </FormItem>

      <FormItem label="📜 Решение суда" fullWidth>
        <textarea
            v-model="form.court_decision"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[80px]"
            placeholder="Введите решение суда..."
            :disabled="!isInCourt"
        ></textarea>
      </FormItem>

      <FormItem label="📅 Дата решения суда">
        <input
            v-model="form.court_decision_date"
            type="date"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            :disabled="!isInCourt"
        />
      </FormItem>

      <FormItem label="📅 Дата судебного приказа">
        <input
            v-model="form.court_order_date"
            type="date"
            class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
            :disabled="!isInCourt"
        />
      </FormItem>
    </div>

    <!-- Блок УФССП с полями -->
    <div class="border-t border-gray-200 mt-4 pt-4">

      <FormItem label="УФССП передано" isCheckbox>
        <template #checkbox>
          <input
              type="checkbox"
              v-model="isUfsspSent"
              class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer"
          />
        </template>
      </FormItem>

      <!-- Поля, связанные с УФССП, с отступом для группировки -->
      <div class="ml-6 mt-2" :class="{'opacity-50': !isUfsspSent}">
        <FormItem label="📑 № производства">
          <input
              v-model="form.execution_number"
              type="text"
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Введите номер производства"
              :disabled="!isUfsspSent"
          />
        </FormItem>

        <FormItem label="📅 Дата производства">

          <input
              v-model="form.execution_date"
              type="date"
              class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
              :disabled="!isUfsspSent"
          />
        </FormItem>
      </div>
    </div>
  </FormSection>
</template>

<script setup>
import {ref, computed, watch, onMounted} from 'vue'
import FormSection from '@/components/common/FormSection.vue'
import FormItem from '@/components/common/FormItem.vue'

const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})

// Создаем реактивные переменные для чекбоксов
const isInCourt = ref(false)
const isUfsspSent = ref(false)

// Инициализация и синхронизация с формой
onMounted(() => {
  // Преобразование значений из числа/строки в boolean
  isInCourt.value = !!props.form.is_in_court
  isUfsspSent.value = !!props.form.ufssp_sent
})

// Наблюдаем за изменениями в форме
watch(() => props.form, (newVal) => {
  if (newVal) {
    isInCourt.value = !!newVal.is_in_court
    isUfsspSent.value = !!newVal.ufssp_sent
  }
}, {deep: true})

// Наблюдаем за изменениями в чекбоксах и обновляем форму
watch(isInCourt, (newVal) => {
  props.form.is_in_court = newVal ? 1 : 0
})

watch(isUfsspSent, (newVal) => {
  props.form.ufssp_sent = newVal ? 1 : 0
})
</script>