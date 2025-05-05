<template>
  <FormSection title="Информация о должнике" icon="👤">
    <FormItem label="ФИО должника">
      <input
          v-model="form.debtor_name"
          type="text"
          class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Введите ФИО должника"
      />
    </FormItem>

    <FormItem label="🏠 Адрес должника">
      <div class="relative">
        <input
            v-model="query"
            @input="onInput"
            type="text"
            placeholder="Начните вводить адрес..."
            class="w-full border rounded p-2"
        />

        <!-- Список подсказок -->
        <ul
            v-if="suggestions.length"
            class="absolute z-10 bg-white border rounded w-full max-h-60 overflow-auto mt-1"
        >
          <li
              v-for="s in suggestions"
              :key="s.data.debtor_fias_id + s.value"
              @click="selectSuggestion(s)"
              class="p-2 hover:bg-gray-100 cursor-pointer"
          >
            {{ s.unrestricted_value }}
          </li>
        </ul>
      </div>
    </FormItem>

    <!--    <FormItem label="🏠 Адрес должника">-->
    <!--      <input-->
    <!--          v-model="form.debtor_address"-->
    <!--          type="text"-->
    <!--          class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none"-->
    <!--          placeholder="Введите адрес должника"-->
    <!--      />-->
    <!--    </FormItem>-->
  </FormSection>
</template>

<script setup>
import FormSection from '@/components/common/FormSection.vue'
import FormItem from '@/components/common/FormItem.vue'
import {dadata} from '@/dadata';
import {onMounted, ref, watch} from "vue";

const props = defineProps({
  form: {
    type: Object,
    required: true
  }
})
// локальный ввод
const query = ref(props.form.debtor_address || '');
// подсказки от DaData
const suggestions = ref([]);
// таймер для «дебаунса»
let timer = null;

function onInput() {
  // очищаем прошлую задачу
  clearTimeout(timer);
  const q = query.value.trim();
  if (!q) {
    suggestions.value = [];
    return;
  }

  // через 300 мс после последнего ввода шлём запрос
  timer = setTimeout(async () => {
    try {
      const resp = await dadata.post('/suggest/address',
          {
            query: q,
            "locations": [{"region": "Томская"}]
          });
      suggestions.value = resp.data.suggestions || [];
    } catch (err) {
      console.error('DaData error', err);
      suggestions.value = [];
    }
  }, 300);
}

function selectSuggestion(s) {
  // записываем в форму полный адрес и FIAS-код
  props.form.debtor_address = s.unrestricted_value;
  props.form.debtor_fias_id = s.data.fias_id;

  // очищаем подсказки и локальный ввод
  suggestions.value = [];
  query.value = s.unrestricted_value;
}

onMounted(() => {
  if (props.form.debtor_address) {
    query.value = props.form.debtor_address;
  }
});

watch(
    () => props.form.debtor_address,
    (newAddr) => {
      query.value = newAddr || '';
      suggestions.value = [];
    }
);
</script>