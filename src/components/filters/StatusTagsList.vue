<template>
  <div class="grid grid-cols-3 gap-1">
  <Badge v-for="value in selected"
         :key="value"
         class="border-0 text-black h-6 m-0 w-full"
         variant="outline"
         :class="getStatusBadgeClass(value)">
    Статус: {{ getStatusLabel(value) }}
    <Button size="icon"
            @click.stop="remove(value)"
            class="cursor-pointer shadow-none w-2 h-2 m-0 p-0">
      <SquareX class="text-red-500"/>
    </Button>
  </Badge>
  </div>
</template>

<script setup>
import {computed} from 'vue'
import {SquareX} from "lucide-vue-next";
import {Button} from "@/components/ui/button/index.js";
import {Badge} from "@/components/ui/badge/index.js";

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