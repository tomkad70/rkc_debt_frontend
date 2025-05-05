<template>
  <FormSection title="Документы" icon="📎">
    <FormItem label="Подпись заказчика" isCheckbox>
      <template #checkbox>
        <input
            type="checkbox"
            v-model="form.has_signature"
            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer"
        />
      </template>
    </FormItem>

    <FormItem label="Документы предоставлены" isCheckbox>
      <template #checkbox>
        <input
            type="checkbox"
            v-model="form.has_documents"
            class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-2 cursor-pointer"
        />
      </template>
    </FormItem>

    <FormItem label="📝 Примечание к документам" fullWidth>
      <textarea
          v-model="form.documents_note"
          class="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[80px]"
          placeholder="Укажите примечания к документам..."
      ></textarea>
    </FormItem>
  </FormSection>
</template>

<script setup>
import FormSection from '@/components/common/FormSection.vue'
import FormItem from '@/components/common/FormItem.vue'

defineProps({
  form: {
    type: Object,
    required: true
  }
})
</script>