<template>
  <FormSection title="Финансовая информация" icon="💰">
    <FormItem label="💸 № платежки">
      <input
          v-model="form.payment_number"
          type="text"
          class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Введите номер платежки"
      />
    </FormItem>

    <FormItem label="💰 Сумма платежки">
      <div class="relative">
        <input
            v-model="form.payment_sum"
            type="number"
            step="0.01"
            class="w-full border border-gray-300 rounded-lg p-2.5 pr-6 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="0.00"
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span class="text-gray-500">₽</span>
        </div>
      </div>
    </FormItem>

    <FormItem label="🧾 Итоговая стоимость">
      <div class="relative">
        <input
            v-model="form.total_cost"
            type="number"
            step="0.01"
            class="w-full border border-gray-300 rounded-lg p-2.5 pr-6 focus:ring-blue-500 focus:border-blue-500 outline-none"
            :class="{'bg-blue-50 border-blue-300': isCalculatedPrice}"
            placeholder="0.00"
        />
        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span class="text-gray-500">₽</span>
        </div>
      </div>
      <div v-if="calculatedTotalPrice > 0 && Number(form.total_cost) !== calculatedTotalPrice"
           class="mt-1.5 text-xs text-blue-600">
        <button @click="applyCalculatedPrice" class="underline hover:text-blue-800">
          Рассчитанная сумма из услуг: {{ formatPrice(calculatedTotalPrice) }} (нажмите, чтобы применить)
        </button>
      </div>
    </FormItem>

    <FormItem label="Заявка исполнена" isCheckbox>
      <template #checkbox>
        <input
            type="checkbox"
            v-model="form.is_executed"
            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer"
        />
      </template>
    </FormItem>
  </FormSection>
</template>

<script setup>
import { ref, watch} from 'vue'
import {FormSection, FormItem} from '@/components/common/index.js'


const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  calculatedTotalPrice: {
    type: Number,
    default: 0
  }
})

const isCalculatedPrice = ref(false)

// Применить рассчитанную цену
// const applyCalculatedPrice = () => {
//   if (props.calculatedTotalPrice > 0) {
//     props.form.total_cost = props.calculatedTotalPrice
//     isCalculatedPrice.value = true
//   }
// }
// Применить рассчитанную цену (и в total_cost, и в payment_sum)
const applyCalculatedPrice = () => {
  if (props.calculatedTotalPrice > 0) {
    props.form.total_cost = props.calculatedTotalPrice
    props.form.payment_sum = props.calculatedTotalPrice
    isCalculatedPrice.value = true
  }
}

// Форматирование цены
const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00 ₽';
  return parseFloat(price).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' ₽';
}

// Отслеживаем изменения в форме
watch(() => props.form.total_cost, (newValue) => {
  // Если цена совпадает с рассчитанной, помечаем как рассчитанную
  isCalculatedPrice.value = Number(newValue) === props.calculatedTotalPrice
}, {immediate: true})

// Если рассчитанная цена изменилась и совпадает с текущей ценой формы
// watch(() => props.calculatedTotalPrice, (newValue) => {
//   isCalculatedPrice.value = Number(props.form.total_cost) === newValue
// }, {immediate: true})

// Авто‑заполнение при изменении рассчитанной суммы
watch(() => props.calculatedTotalPrice, (newValue) => {
  if (newValue > 0) {
    props.form.total_cost = newValue
    props.form.payment_sum = newValue
    isCalculatedPrice.value = true
  } else {
    // услуг не осталось — очищаем поля
    props.form.total_cost = ''
    props.form.payment_sum = ''
    isCalculatedPrice.value = false
  }
}, {immediate: true})



</script>