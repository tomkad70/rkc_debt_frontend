<template>
  <div class="flex flex-col space-y-2">
    <div class="flex justify-between items-center">
      <Button v-if="isAdmin"
              variant="outline"
              @click="$emit('create-new')"
              class="cursor-pointer bg-white w-full md:w-fit border-0 shadow-sm ring-0 outline-none">
        <PlusIcon color="green"/>
        Создать заявку
      </Button>
    </div>

    <!-- Filters Grid -->
    <Card class="border-0 mb-2 bg-white">
      <CardHeader>
        <CardTitle>
          <div class="flex justify-start items-center">
            <Funnel :size="15" color="" class="mr-2"/>
            Фильтры
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent class="">
        <div class="grid grid-cols-2 lg:grid-cols-12 gap-2 select-none ring-none outline-0">
          <!-- Payment Status -->
          <Select v-model="localFilters.payment_status"
                  @update:model-value="applyFilters"
                  class=""
          >
            <SelectTrigger class="cursor-pointer w-full border  border-slate-300 ring-0 outline-0 outline-none">
              <SelectValue placeholder="Статус оплаты" class=""/>
            </SelectTrigger>
            <SelectContent class=" bg-white border border-slate-300">
              <SelectItem value="paid" class="hover:bg-gray-300 cursor-pointer">
                Оплачено
              </SelectItem>
              <SelectItem value="unpaid" class="hover:bg-gray-300 cursor-pointer">
                Неоплачено
              </SelectItem>
            </SelectContent>
          </Select>
          <!-- Registry -->
          <Select v-if="registries.length" v-model="localFilters.registry_id"
                  @update:model-value="applyFilters">
            <SelectTrigger class="cursor-pointer w-full border border-slate-300">
              <SelectValue placeholder="Все реестры"/>
            </SelectTrigger>
            <SelectContent
                class="bg-white border border-slate-300">
              <SelectItem v-for="r in registries"
                          :key="r.id"
                          :value="r.id"
                          class="hover:bg-gray-300 cursor-pointer">
                <SelectItemText>
                  №-{{ r.number }}
                </SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Organization -->
          <Select v-model="localFilters.organization_id"
                  @update:model-value="applyFilters">
            <SelectTrigger
                class="cursor-pointer w-full border border-slate-300"
            >
              <SelectValue placeholder="Орг."/>
            </SelectTrigger>
            <SelectContent
                class="bg-white border border-slate-300">
              <SelectItem v-for="org in organizations"
                          :key="org.id"
                          :value="org.id"
                          class=" hover:bg-gray-300 cursor-pointer">
                <SelectItemText>
                  {{ org.name }}
                </SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Multi Status Select -->
          <Select multiple v-model="localFilters.statuses"
                  @update:model-value="applyFilters"
                  class=""
          >
            <SelectTrigger class="cursor-pointer w-full border border-slate-300">
              <SelectValue placeholder="Статус заявки"/>
            </SelectTrigger>
            <SelectContent class=" bg-white border border-slate-300">
              <SelectItem v-for="s in statusOptions" :key="s.label" :value="s.value"
                          class="hover:bg-gray-100 cursor-pointer">
                <SelectItemText>
                  {{ s.label }}
                </SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>

          <!-- Lawyer User -->
          <Select v-if="lawyerUsers.length" v-model="localFilters.user_id"
                  @update:model-value="applyFilters">
            <SelectTrigger
                class="cursor-pointer w-full border border-slate-300"
            >
              <SelectValue placeholder="Юристы"/>
            </SelectTrigger>
            <SelectContent
                class="bg-white border border-slate-300">
              <SelectItem v-for="u in lawyerUsers" :key="u.id" :value="u.id" class="hover:bg-gray-300 cursor-pointer">
                <SelectItemText>
                  {{ u.name }}
                </SelectItemText>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

      </CardContent>
    </Card>
    <!-- Active filters -->
    <!--    <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 pt-2">-->
    <Card v-if="hasActiveFilters" class="border-0 mb-2 bg-white">
      <CardHeader class="h-2">
        <CardTitle class="h-2">
          Активные фильтры:
        </CardTitle>
      </CardHeader>
      <CardContent class="text-sm grid gap-2 grid-cols-1 place-items-center md:place-items-start ">
        <Badge v-if="localFilters.payment_status" class="border-0 text-fuchsia-800 bg-fuchsia-100 h-6 " variant="">
          {{ getStatusPayment(localFilters.payment_status) }}
          <Button size="icon"
                  @click="clearFilter('payment_status')"
                  class="cursor-pointer shadow-none w-2">
            <SquareX class="text-red-500"/>
          </Button>
        </Badge>

        <Badge v-if="localFilters.registry_id" class="border-0 text-blue-800 h-6 " variant="outline">
          Реестр: №{{ getRegistryNumber(localFilters.registry_id) }}
          <Button size="icon" @click="clearFilter('registry_id')" class="cursor-pointer shadow-none w-2">
            <SquareX class="text-red-500"/>
          </Button>
        </Badge>

        <Badge v-if="localFilters.organization_id" class="border-0 text-indigo-800 bg-indigo-100 h-6 " variant="outline">
          Организация: {{ getOrganizationName(localFilters.organization_id) }}
          <Button size="icon" @click="clearFilter('organization_id')" class="cursor-pointer shadow-none w-2">
            <SquareX class="text-red-500"/>
          </Button>
        </Badge>

        <Badge v-if="localFilters.user_id" class="border-0 text-cyan-800 h-6 bg-cyan-100" variant="outline">Юрист:
          {{ getUserName(localFilters.user_id) }}
          <Button size="icon" @click="clearFilter('user_id')" class="cursor-pointer shadow-none w-2">
            <SquareX class="text-red-500"/>
          </Button>
        </Badge>
        <!-- Status tags list -->
        <StatusTagsList
            v-if="localFilters.statuses && localFilters.statuses.length > 0"
            :options="statusOptions"
            :selected="localFilters.statuses"
            @remove="removeStatus"
            @removeAll="clearFilter('statuses')"
        />


      </CardContent>
      <CardFooter>
        <button
            @click="resetFilters"
            type="button"
            class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
        >
          Сбросить все
        </button>
      </CardFooter>
    </Card>
  </div>


</template>

<script setup>
import {computed, reactive, watch} from 'vue'
import {StatusMultiSelect, StatusTagsList} from './index.js'
import {PlusIcon, Funnel, SquareX} from 'lucide-vue-next'

import {
  Select,
  SelectItem,
  SelectItemText,
  SelectSeparator,
  SelectLabel,
  SelectContent,
  SelectGroup,
  SelectValue,
  SelectTrigger
} from "@/components/ui/select/index.js";

import {Card, CardTitle, CardHeader, CardContent, CardFooter} from "@/components/ui/card/index.js"
import {Badge} from "@/components/ui/badge/index.js"
import {Button} from "@/components/ui/button/index.js"

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  registries: {
    type: Array,
    default: () => []
  },
  organizations: {
    type: Array,
    default: () => []
  },
  users: {
    type: Array,
    default: () => []
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
})

const paymentOptions = [
  {value: 'paid', label: 'Оплаченные'},
  {value: 'unpaid', label: 'Неоплаченные'}
]

const emit = defineEmits(['update:filters', 'apply-filters', 'create-new'])

// Local copy of filters
const localFilters = reactive({
  registry_id: props.filters.registry_id || '',
  organization_id: props.filters.organization_id || '',
  statuses: props.filters.statuses || [],
  user_id: props.filters.user_id || '',
  payment_status: props.filters.payment_status || ''
})

// Synchronize local filters with props
watch(() => props.filters, (newFilters) => {
  localFilters.registry_id = newFilters.registry_id || ''
  localFilters.organization_id = newFilters.organization_id || ''
  localFilters.statuses = newFilters.statuses || []
  localFilters.user_id = newFilters.user_id || ''
  localFilters.payment_status = newFilters.payment_status || ''
}, {deep: true})

// Computed properties
const hasActiveFilters = computed(() => {
  return localFilters.registry_id !== '' ||
      localFilters.organization_id !== '' ||
      (localFilters.statuses && localFilters.statuses.length > 0) ||
      localFilters.user_id !== '' ||
      localFilters.payment_status !== ''
})

const lawyerUsers = computed(() => {
  return props.users.filter(user => user.roles && user.roles.includes('lawyer'))
})

const statusOptions = computed(() => [
  {value: 'новая', label: 'Новая'},
  {value: 'в работе', label: 'В работе'},
  {value: 'закрыта', label: 'Закрыта'}
])

// Methods
const applyFilters = () => {
  console.log('localFilters')
  emit('update:filters', {...localFilters})
  emit('apply-filters')
}

const clearFilter = (filterName) => {
  if (filterName === 'statuses') {
    localFilters[filterName] = []
  } else {
    localFilters[filterName] = ''
  }
  applyFilters()
}

const removeStatus = (value) => {
  localFilters.statuses = localFilters.statuses.filter(status => status !== value)
  applyFilters()
}

const resetFilters = () => {
  localFilters.registry_id = ''
  localFilters.organization_id = ''
  localFilters.statuses = []
  localFilters.user_id = ''
  localFilters.payment_status = ''
  applyFilters()
}

// Helper methods
const getRegistryNumber = (registryId) => {
  const registry = props.registries.find(r => String(r.id) === String(registryId))
  return registry ? registry.number : '—'
}

const getOrganizationName = (orgId) => {
  const org = props.organizations.find(o => String(o.id) === String(orgId))
  return org ? org.name : '—'
}

const getUserName = (userId) => {
  const user = props.users.find(u => String(u.id) === String(userId))
  return user ? user.name : '—'
}
const getStatusPayment = (value) => {
  const option = paymentOptions.find(o => o.value === value)
  return option ? option.label : ''
}

</script>