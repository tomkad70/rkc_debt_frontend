<template>
  <AppLayout title="Администрирование" :loading="loading">
    <div class="max-w-7xl mx-auto">
      <!-- Header with stats -->
      <div class="mb-6 bg-white rounded-lg shadow-sm p-5">
        <div class="flex flex-col sm:flex-row justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Пользователи</h1>
            <p class="text-gray-500 mt-1">Управление учетными записями и правами доступа</p>
          </div>
          <div class="mt-4 sm:mt-0 flex items-center">
            <div class="bg-blue-50 rounded-lg p-3">
              <div class="font-medium text-sm text-blue-800">Всего пользователей</div>
              <div class="text-2xl font-bold text-blue-600">{{ users.length }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions bar -->
      <div class="bg-white rounded-lg shadow-sm p-5 mb-6">
        <div class="flex flex-col sm:flex-row justify-between items-center">
          <h2 class="text-lg font-medium text-gray-800 mb-3 sm:mb-0">Список пользователей системы</h2>
          <button
              @click="showCreateModal = true"
              class="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium"
          >
            <span class="flex items-center justify-center gap-2">
              <span>➕</span> Добавить пользователя
            </span>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>👤</span> Имя
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>✉️</span> Email
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center gap-1">
                  <span>🔰</span> Роль
                </div>
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
            </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="getRoleBadgeClass(user.roles?.[0])">
                    {{ user.roles?.[0] || '—' }}
                  </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button
                      title="Изменить роль"
                      @click="openRoleModal(user)"
                      class="cursor-pointer text-indigo-600 hover:text-indigo-900 p-1.5 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >🛠️</button>
                  <button-rkc variant="outline" size="icon">1</button-rkc>
                  <button
                      title="Сбросить пароль"
                      @click="openResetModal(user)"
                      class="cursor-pointer text-amber-600 hover:text-amber-900 p-1.5 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >🔁</button>
                  <button
                      title="Логи"
                      @click="openLogModal(user)"
                      class="cursor-pointer text-gray-600 hover:text-gray-900 p-1.5 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >📜</button>
                  <button
                      title="Изменить права"
                      @click="editPermissions(user)"
                      class="cursor-pointer text-blue-600 hover:text-blue-900 p-1.5 hover:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >⚙️</button>
                </div>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <div class="text-4xl mb-3">👥</div>
                  <div class="text-lg font-medium">Нет пользователей</div>
                  <div class="text-sm">Добавьте первого пользователя с помощью кнопки выше</div>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Модальные окна -->
    <CreateUserModal
        v-if="showCreateModal"
        @close="showCreateModal = false"
        @created="handleUserCreated"
    />

    <RoleModal
        v-if="showRoleModal"
        :user="selectedUser"
        @close="showRoleModal = false"
        @updated="loadUsers"
    />

    <ResetPasswordModal
        v-if="showResetModal"
        :user="selectedUser"
        @close="showResetModal = false"
    />

    <LogModal
        v-if="showLogModal"
        :user="selectedUser"
        @close="showLogModal = false"
    />

    <UserPermissionsModal
        v-if="permissionsUser"
        :user="permissionsUser"
        @close="permissionsUser = null"
        @updated="loadUsers"
    />
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'
import AppLayout from '../pages/AppLayout.vue'
import CreateUserModal from '../components/CreateUserModal.vue'
import RoleModal from '../components/RoleModal.vue'
import ResetPasswordModal from '../components/ResetPasswordModal.vue'
import LogModal from '../components/LogModal.vue'
import UserPermissionsModal from "@/components/UserPermissionsModal.vue";
import ButtonRkc from "@/components/ui/button/ButtonRkc.vue";

const router = useRouter()
const users = ref([])
const loading = ref(true)
const showRoleModal = ref(false)
const showResetModal = ref(false)
const showLogModal = ref(false)
const showCreateModal = ref(false)
const selectedUser = ref(null)
const permissionsUser = ref(null)

const loadUsers = async () => {
  loading.value = true
  try {
    const response = await api.get('/users')
    users.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to load users:', error)
  } finally {
    loading.value = false
  }
}

const handleUserCreated = () => {
  showCreateModal.value = false
  loadUsers()
}

const openRoleModal = (user) => {
  selectedUser.value = user
  showRoleModal.value = true
}

const openResetModal = (user) => {
  selectedUser.value = user
  showResetModal.value = true
}

const openLogModal = (user) => {
  selectedUser.value = user
  showLogModal.value = true
}

const editPermissions = (user) => {
  permissionsUser.value = user
}

const getRoleBadgeClass = (role) => {
  const roleClasses = {
    'admin': 'bg-red-100 text-red-800',
    'manager': 'bg-blue-100 text-blue-800',
    'user': 'bg-green-100 text-green-800',
    'accountant': 'bg-purple-100 text-purple-800',
    'editor': 'bg-yellow-100 text-yellow-800'
  }

  return role ? roleClasses[role.toLowerCase()] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'
}

onMounted(() => {
  const storedRole = localStorage.getItem('role')
  if (storedRole !== 'admin') {
    router.push('/dashboard')
    return
  }
  loadUsers()
})
</script>