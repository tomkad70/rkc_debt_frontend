<template>
  <div v-if="selected.length > 0" class="flex flex-wrap gap-2">
    <div
        v-for="value in selected"
        :key="value"
        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
        :class="getStatusBadgeClass(value)"
    >
      {{ getStatusLabel(value) }}
      <button
          @click.stop="remove(value)"
          class="ml-1 hover:opacity-70 cursor-pointer min-w-6 min-h-6 flex items-center justify-center"
          aria-label="Удалить фильтр"
          type="button"
      >
        ✕
      </button>
    </div>
    <button
        v-if="selected.length > 1"
        @click.stop="removeAll"
        class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
        type="button"
    >
      Сбросить все
    </button>
  </div>
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  options: {
    type: Array,
    required: true
  },
  selected: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['remove', 'removeAll'])

// Methods
const remove = (value) => {
  emit('remove', value)
}

const removeAll = () => {
  emit('removeAll')
}

// Helper methods
const getStatusLabel = (value) => {
  const option = props.options.find(opt => opt.value === value)
  return option ? option.label : value
}

const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'новая': 'bg-blue-100 text-blue-800',
    'в работе': 'bg-yellow-100 text-yellow-800',
    'закрыта': 'bg-green-100 text-green-800'
  }

  return status ? statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'
}
</script>