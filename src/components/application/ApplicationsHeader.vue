<template>
  <Card class="border-0 mb-2 bg-white">
    <CardHeader class="">
      <CardTitle class="text-2xl text-gray-800">
        Заявки
        <CardDescription>
          Управление и мониторинг заявок
        </CardDescription>
      </CardTitle>
    </CardHeader>
    <CardContent class="flex sm:flex-row md:justify-between">
      <div></div>
      <div class="sm:mt-0 flex gap-2 w-full md:w-fit justify-between md:justify-start">
        <div class="bg-blue-50 rounded-lg p-3 text-center w-full md:min-w-[200px]">
          <div class="font-medium text-sm text-blue-800">Всего заявок</div>
          <div class="text-2xl font-bold text-blue-600">{{ totalApplications }}</div>
        </div>
        <div class="bg-green-50 rounded-lg p-3 text-center w-full md:min-w-[200px]">
          <div class="font-medium text-sm text-green-800">Активных</div>
          <div class="text-2xl font-bold text-green-600">{{ activeApplications }}</div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import {Card, CardTitle, CardHeader, CardContent, CardFooter,CardDescription} from "@/components/ui/card/index.js"

defineProps({
  totalApplications: {
    type: Number,
    default: 0
  },
  activeApplications: {
    type: Number,
    default: 0
  }
})
</script>