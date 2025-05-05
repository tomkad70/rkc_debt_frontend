<template>
  <FormSection title="Основная информация" icon="📋">
    <!-- Номер заявки (ID) - доступен только для просмотра -->
    <FormItem v-if="form.id" label="🔢 Номер заявки">
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500">№</span>
        </div>
        <input
            :value="form.id"
            disabled
            class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-700 font-medium"
        />
      </div>
    </FormItem>
    <FormItem label="📅 Дата заявки">
      <input
          v-model="form.application_date"
          type="date"
          class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
      />
    </FormItem>

    <FormItem label="📌 Статус">
      <select
          v-model="form.status"
          class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
      >
        <option value="новая">🆕 Новая</option>
        <option value="в работе">⚙️ В работе</option>
        <option value="закрыта">✅ Закрыта</option>
      </select>
    </FormItem>

    <FormItem label="🏢 Организация">
      <div class="relative">
        <div v-if="isAdmin" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500">🏢</span>
        </div>
        <!-- Для админа показываем выпадающий список -->
        <select
            v-if="isAdmin"
            v-model="form.organization_id"
            class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
        >
          <option v-for="org in organizations" :key="org.id" :value="org.id">
            {{ org.name }} - {{ org.inn }}
          </option>
        </select>
        <!-- Для других пользователей показываем неактивное поле -->
        <input
            v-else
            :value="form.organization"
            disabled
            class="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-600"
        />
      </div>
    </FormItem>
    <!-- Договора организации -->
    <FormItem label="📄 Договор">
      <div class="relative">
        <div v-if="isAdmin" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500">📄</span>
        </div>

        <!-- Админ может выбирать договор -->
        <select
            v-if="isAdmin"
            v-model="form.contract_id"
            class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-700 cursor-pointer"
        >
          <option value="" disabled>Выберите договор</option>
          <option
              v-for="contract in organizationContracts"
              :key="contract.id"
              :value="contract.id"
              :disabled="isExpired(contract)"
              :class="{ 'text-red-500': isExpired(contract) }"
          >
            {{ contract.title || contract.number }} — до {{ formatDate(contract.ends_at) }}
          </option>
        </select>

        <!-- Обычным пользователям просто показываем название выбранного договора -->
        <input
            v-else
            :value="selectedContractName"
            disabled
            class="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-600"
        />
      </div>

      <!-- Информация о выбранном договоре под полем -->
      <div v-if="selectedContract" class="mt-2 text-sm">
        <p class="text-gray-600">
          Выбрано: {{ selectedContract.title || selectedContract.number }}
          — до {{ formatDate(selectedContract.ends_at) }}

          <span v-if="isExpired(selectedContract)" class="text-red-500 font-medium ml-2">
        ⚠️ Просрочен
      </span>
        </p>
      </div>
    </FormItem>

    <!-- Договора организации -->
    <!--    <FormItem label="📄 Договора">-->
    <!--      <div class="relative">-->
    <!--        <div v-if="isAdmin" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">-->
    <!--          <span class="text-gray-500">📄</span>-->
    <!--        </div>-->
    <!--        &lt;!&ndash; Админ может выбирать контракт &ndash;&gt;-->
    <!--        <select-->
    <!--            v-if="isAdmin"-->
    <!--            v-model="form.contract_id"-->
    <!--            class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 bg-white text-gray-700 cursor-pointer"-->
    <!--        >-->
    <!--          <option value="" disabled>Выберите договор</option>-->
    <!--          <option-->
    <!--              v-for="contract in contracts"-->
    <!--              :key="contract.id"-->
    <!--              :value="contract.id"-->
    <!--              :disabled="isExpired(contract)"-->
    <!--              :class="{ 'text-red-500': isExpired(contract) }"-->
    <!--          >-->
    <!--            {{ contract.title || contract.number }} — до {{ formatDate(contract.ends_at) }}-->
    <!--          </option>-->
    <!--        </select>-->
    <!--        &lt;!&ndash; Обычным пользователям просто показываем название выбранного договора &ndash;&gt;-->
    <!--        <input-->
    <!--            v-else-->
    <!--            :value="selectedContractName"-->
    <!--            disabled-->
    <!--            class="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-600"-->
    <!--        />-->
    <!--      </div>-->
    <!--    </FormItem>-->

    <FormItem label="👨‍⚖ Юрист">
      <div class="relative">
        <div v-if="isAdmin" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="text-gray-500">👨‍⚖</span>
        </div>
        <!-- Для админа показываем выпадающий список -->
        <select
            v-if="isAdmin"
            v-model="form.user_id"
            class="pl-10 w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer"
        >
          <option v-for="user in lawyers" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
        <!-- Для других пользователей показываем неактивное поле -->
        <input
            v-else
            :value="form.lawyer"
            disabled
            class="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-600"
        />
      </div>
    </FormItem>
  </FormSection>
</template>

<script setup>
import FormSection from '@/components/common/FormSection.vue'
import FormItem from '@/components/common/FormItem.vue'
import {computed} from "vue";

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  organizations: {
    type: Array,
    default: () => []
  },
  lawyers: {
    type: Array,
    default: () => []
  },
  contracts: {
    type: Array,
    default: () => []
  },
  currentContract: {type: Object, default: () => []},
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const isExpired = (contract) => {
  return new Date(contract.ends_at) < new Date();
};

const formatDate = (dateString) => {
  const options = {year: 'numeric', month: 'long', day: 'numeric'};
  return new Date(dateString).toLocaleDateString('ru-RU', options);
};

// Вычисляем выбранный договор
const selectedContract = computed(() => {
  return props.contracts.find(contract => contract.id === props.form.contract_id) || null
})

// Если тебе нужен список договоров текущей организации:
const organizationContracts = computed(() => {
  const orgId = props.form.organization_id
  if (!orgId) return []

  return props.contracts.filter(contract => contract.organization_id === orgId)
})
</script>