<template>
  <BaseModal
      :title="formTitle"
      :subtitle="formSubtitle"
      icon="📝"
      v-model="isOpen"
      @close="$emit('close')"
  >
    <!-- Содержимое формы в основном слоте -->
    <form @submit.prevent="submit" class="space-y-6">
      <!-- Общая информация -->
      <GeneralInfoSection
          :form="form"
          :organizations="organizations"
          :current-contract="currentContract"
          :contracts="contracts"
          :lawyers="lawyers"
          :isAdmin="isAdmin"
      />

      <!-- Документы -->
      <DocumentsSection :form="form"/>

      <!-- Информация о должнике -->
      <DebtorInfoSection :form="form"/>

      <!-- Судебная информация -->
      <CourtInfoSection :form="form"/>

      <!-- Этапы заявки (улучшенная версия) -->
      <ApplicationStepsSection :form="form"/>

      <!-- Состав и стоимость услуг (улучшенная версия) -->
      <ApplicationServicesSection
          :form="form"
          @update:totalCost="updateTotalCost"
      />

      <!-- Финансовая информация -->
      <FinancialInfoSection
          :form="form"
          :calculatedTotalPrice="calculatedTotalPrice"
      />
    </form>

    <!-- Слоты для футера должны быть на одном уровне с основным содержимым -->
    <template #footer>
      <div class="flex justify-end space-x-3">
        <Button
            @click.prevent="$emit('close')"
            variant="outline"
        >
          Отмена
        </Button>
        <Button
            @click.prevent="submit"
            variant="default"
        >
          <span class="flex items-center justify-center">
            <span class="mr-2">💾</span>
            {{ submitButtonText }}
          </span>
        </Button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue'
import {BaseModal} from '../common/index.js'
import {
  GeneralInfoSection,
  DocumentsSection,
  DebtorInfoSection,
  CourtInfoSection,
  FinancialInfoSection,
  ApplicationStepsSection,
  ApplicationServicesSection
} from './index.js'

import {Button} from '@/components/ui/button'

// Импорт composables
import {useApplicationForm, useOrganizationsAndUsers} from '@/composables/application/index.js'

const props = defineProps({
  /**
   * Объект заявки для редактирования (если null, то создание новой заявки)
   */
  application: Object
})

const emit = defineEmits(['close', 'updated'])

// Состояние открытия модального окна
const isOpen = ref(true)
const currentContract = ref(null);

// Ref для хранения рассчитанной суммы из услуг
const calculatedTotalPrice = ref(0)

// Упрощенная инициализация формы - больше не нужно искать ID по именам
const {form, submit, formTitle, formSubtitle, submitButtonText, normalizeIds} = useApplicationForm(
    props,
    emit
)

// Загрузка данных организаций и пользователей
const {organizations, lawyers,contracts, isAdmin, loadData} = useOrganizationsAndUsers(form)


const loadCurrentContract = () => {
  const now = new Date()

  if (!form.organization_id || !contracts.value?.length) return;

  const orgContracts = contracts.value.filter(
      contract => contract.organization_id === form.organization_id
  );

  const sortedContracts = [...orgContracts].sort(
      (a, b) => new Date(b.ends_at) - new Date(a.ends_at)
  );

  const activeContract = sortedContracts.find(
      contract => new Date(contract.ends_at) > new Date()
  );

  currentContract.value = activeContract || sortedContracts[0];
  console.log(currentContract)
};

// Функция обновления общей стоимости из компонента услуг
const updateTotalCost = (newTotalCost) => {
  calculatedTotalPrice.value = newTotalCost

  // Если форма ещё не содержит значения total_cost, устанавливаем его автоматически
  if (form.total_cost === undefined || form.total_cost === null || form.total_cost === '') {
    form.total_cost = newTotalCost
  }
}

// Инициализация пустых массивов для этапов и услуг, если их нет
if (!form.steps) {
  form.steps = []
}

if (!form.services) {
  form.services = []
}

// Вычисляем начальную сумму услуг при загрузке компонента
const calculateInitialTotalCost = () => {
  if (form.services && Array.isArray(form.services)) {
    const lawyerTotal = form.services.reduce((sum, service) => sum + (Number(service.lawyer_price) || 0), 0)
    const partnerTotal = form.services.reduce((sum, service) => sum + (Number(service.partner_price) || 0), 0)
    calculatedTotalPrice.value = lawyerTotal + partnerTotal
  }
}

// Загружаем только справочные данные при монтировании компонента
onMounted(async () => {
  await loadData()
  normalizeIds() // Только конвертация строковых ID в числовые
  calculateInitialTotalCost() // Рассчитываем начальную сумму
  if (form.organization_id) {
    loadCurrentContract(); // <-- загружаем договор
  }
})

// Список договоров текущей организации
const organizationContracts = computed(() => {
  if (!form.organization_id || !contracts.value?.length) return []

  return contracts.value
      .filter(contract => contract.organization_id === form.organization_id)
      .sort((a, b) => new Date(b.ends_at) - new Date(a.ends_at))
})


</script>

<style scoped>
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