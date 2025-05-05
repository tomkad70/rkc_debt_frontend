<template>
  <div class="relative" id="status-dropdown">
    <!-- Trigger button with icon -->
    <div
        @click="toggleDropdown"
        class="relative cursor-pointer"
    >
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-500">📌</span>
      </div>
      <button
          type="button"
          class="pl-10 block w-full rounded-lg border border-gray-300 py-2.5 focus:border-blue-500 focus:ring-blue-500 focus:outline-none cursor-pointer text-left bg-white"
      >
        {{ buttonText }}
        <span class="absolute inset-y-0 right-3 flex items-center">
          <span v-if="modelValue.length > 0" @click.stop="clearAll" class="mr-2 text-gray-400 hover:text-gray-600">✕</span>
          <span>{{ isOpen ? '▲' : '▼' }}</span>
        </span>
      </button>
    </div>

    <!-- Dropdown menu -->
    <div
        v-show="isOpen"
        class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-2 max-h-60 overflow-y-auto"
    >
      <!-- "Select All" option -->
      <div
          class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
          @click="toggleAll"
      >
        <input
            type="checkbox"
            :checked="isAllSelected"
            class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <span class="ml-2">{{ isAllSelected ? 'Снять всё' : 'Выбрать всё' }}</span>
      </div>

      <div class="border-t border-gray-100 my-1"></div>

      <!-- Individual options -->
      <div
          v-for="option in options"
          :key="option.value"
          class="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center"
          @click="toggleOption(option.value)"
      >
        <input
            type="checkbox"
            :checked="isSelected(option.value)"
            class="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
        />
        <span
            class="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
            :class="getStatusBadgeClass(option.value)"
        >
          {{ option.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'

// Define props and emits
const props = defineProps({
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: Array,
    required: true,
    default: () => []
  },
  placeholder: {
    type: String,
    default: 'Выберите статус(ы)'
  }
})

const emit = defineEmits(['update:modelValue'])

// Local state
const isOpen = ref(false)

// Computed properties
const buttonText = computed(() => {
  if (props.modelValue.length === 0) return props.placeholder
  if (props.modelValue.length === props.options.length) return 'Все статусы'
  return `${props.modelValue.length} выбрано`
})

const isAllSelected = computed(() => {
  return props.modelValue.length === props.options.length
})

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const isSelected = (value) => {
  return props.modelValue.includes(value)
}

const toggleOption = (value) => {
  let newValue = [...props.modelValue]

  if (isSelected(value)) {
    newValue = newValue.filter(v => v !== value)
  } else {
    newValue.push(value)
  }

  emit('update:modelValue', newValue)
}

const toggleAll = () => {
  if (isAllSelected.value) {
    emit('update:modelValue', [])
  } else {
    emit('update:modelValue', props.options.map(option => option.value))
  }
}

const clearAll = (e) => {
  e.stopPropagation()
  emit('update:modelValue', [])
}

// Helper functions
const getStatusBadgeClass = (status) => {
  const statusClasses = {
    'новая': 'bg-blue-100 text-blue-800',
    'в работе': 'bg-yellow-100 text-yellow-800',
    'закрыта': 'bg-green-100 text-green-800'
  }

  return status ? statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'
}

// Click outside handler
const handleClickOutside = (event) => {
  // Проверяем, что клик был не внутри нашего dropdown
  const dropdown = document.getElementById('status-dropdown')
  if (isOpen.value && dropdown && !dropdown.contains(event.target)) {
    isOpen.value = false
  }
}

// Setup event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>