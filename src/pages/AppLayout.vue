<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header with navigation -->
    <header class="bg-gray-800 text-white shadow-md">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo/Title section -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold">РКЦ Панель</h1>
            </div>
            <div class="hidden md:block ml-4">
              <div class="flex items-center space-x-1">
                <span class="text-gray-400">—</span>
                <span class="text-white font-medium ml-1">{{ title }}</span>
              </div>
            </div>
          </div>

          <!-- Navigation - Desktop -->
          <div class="hidden md:block">
            <div class="flex items-center">
              <router-link
                  to="/dashboard"
                  class="nav-link flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                  :class="isActive('/dashboard') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                  active-class="active-nav-link"
                  v-slot="{ navigate, isActive }"
              >
                <span @click="smoothNavigate(navigate, '/dashboard')" class="flex items-center">
                  <span class="mr-1.5">🏠</span> Главная
                </span>
              </router-link>

              <router-link
                  v-if="role"
                  to="/applications"
                  class="nav-link flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                  :class="isActive('/applications') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                  active-class="active-nav-link"
                  v-slot="{ navigate, isActive }"
              >
                <span @click="smoothNavigate(navigate, '/applications')" class="flex items-center">
                  Заявки
                </span>
              </router-link>

              <router-link
                  v-if="role === 'admin'"
                  to="/admin/users"
                  class="nav-link flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                  :class="isActive('/admin/users') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                  active-class="active-nav-link"
                  v-slot="{ navigate, isActive }"
              >
                <span @click="smoothNavigate(navigate, '/admin/users')" class="flex items-center">
                  Пользователи
                </span>
              </router-link>

              <router-link
                  v-if="role === 'admin'"
                  to="/admin/organizations"
                  class="nav-link flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                  :class="isActive('/admin/organizations') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                  active-class="active-nav-link"
                  v-slot="{ navigate, isActive }"
              >
                <span @click="smoothNavigate(navigate, '/admin/organizations')" class="flex items-center">
                  Организации
                </span>
              </router-link>

              <router-link
                  v-if="role === 'admin'"
                  to="/admin/contracts"
                  class="nav-link flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                  :class="isActive('/admin/contracts') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                  active-class="active-nav-link"
                  v-slot="{ navigate, isActive }"
              >
                <span @click="smoothNavigate(navigate, '/admin/contracts')" class="flex items-center">
                  Договора
                </span>
              </router-link>

              <router-link
                  v-if="role === 'admin'"
                  to="/admin/reports"
                  class="nav-link flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                  :class="isActive('/admin/reports') ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                  active-class="active-nav-link"
                  v-slot="{ navigate, isActive }"
              >
                <span @click="smoothNavigate(navigate, '/admin/contracts')" class="flex items-center">
                  Отчёты
                </span>
              </router-link>
            </div>
          </div>

          <!-- User menu and mobile menu button -->
          <div class="flex items-center">
            <!-- User role badge -->
            <div class="hidden md:flex items-center mr-4">
              <div class="relative rounded-full bg-gray-700 px-3 py-1.5 text-xs font-medium text-white">
                {{ roleName }}
              </div>
            </div>

            <!-- Logout button -->
            <button
                @click="confirmLogout"
                class="hidden md:flex items-center py-1.5 px-3 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <span class="mr-1.5">🚪</span> Выйти
            </button>

            <!-- Mobile menu button -->
            <div class="md:hidden flex items-center">
              <button
                  @click="menuOpen = !menuOpen"
                  type="button"
                  class="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span v-if="!menuOpen">
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </span>
                <span v-else>
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu, show/hide based on menu state -->
      <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-8 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-8 opacity-0"
      >
        <div v-if="menuOpen" class="md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700">
            <router-link
                to="/dashboard"
                class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                :class="isActive('/dashboard') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                v-slot="{ navigate }"
                @click.native="menuOpen = false"
            >
              <span @click="smoothNavigate(navigate, '/dashboard')" class="flex items-center">
                <span class="mr-2">🏠</span> Главная
              </span>
            </router-link>

            <router-link
                v-if="role"
                to="/applications"
                class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                :class="isActive('/applications') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                v-slot="{ navigate }"
                @click.native="menuOpen = false"
            >
              <span @click="smoothNavigate(navigate, '/applications')" class="flex items-center">
                <span class="mr-2">📂</span> Заявки
              </span>
            </router-link>

            <router-link
                v-if="role === 'admin'"
                to="/admin/users"
                class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                :class="isActive('/admin/users') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                v-slot="{ navigate }"
                @click.native="menuOpen = false"
            >
              <span @click="smoothNavigate(navigate, '/admin/users')" class="flex items-center">
                <span class="mr-2">👥</span> Пользователи
              </span>
            </router-link>

            <router-link
                v-if="role === 'admin'"
                to="/admin/organizations"
                class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                :class="isActive('/admin/organizations') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                v-slot="{ navigate }"
                @click.native="menuOpen = false"
            >
              <span @click="smoothNavigate(navigate, '/admin/organizations')" class="flex items-center">
                <span class="mr-2">🏢</span> Организации
              </span>
            </router-link>

            <router-link
                v-if="role === 'admin'"
                to="/admin/contracts"
                class="block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ease-in-out cursor-pointer"
                :class="isActive('/admin/contracts') ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'"
                v-slot="{ navigate }"
                @click.native="menuOpen = false"
            >
              <span @click="smoothNavigate(navigate, '/admin/contracts')" class="flex items-center">
                <span class="mr-2">📜</span> Договора
              </span>
            </router-link>

            <!-- Mobile role badge and logout -->
            <div class="flex flex-col pt-2 space-y-3 border-t border-gray-700 mt-2">
              <div class="px-3 text-gray-400 text-sm">
                Роль: <span class="font-medium text-white">{{ roleName }}</span>
              </div>
              <button
                  @click="confirmLogout"
                  class="flex items-center px-3 py-2 text-base font-medium rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors duration-200 cursor-pointer"
              >
                <span class="mr-2">🚪</span> Выйти
              </button>
            </div>
          </div>
        </div>
      </transition>
    </header>

    <!-- Main content area -->
    <main class="flex-grow">
      <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <transition
            name="page"
            mode="out-in"
            @before-leave="beforePageLeave"
            @enter="onPageEnter"
            @after-enter="afterPageEnter"
        >
          <div :key="$route.fullPath" class="page-container">
            <slot />
          </div>
        </transition>
      </div>
    </main>

    <!-- Footer (Optional) -->
    <footer class="bg-gray-800 text-white py-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center text-sm">
          <div>© 2025 РКЦ Панель</div>
          <div>Версия 1.0</div>
        </div>
      </div>
    </footer>

    <!-- Loading Overlay -->
    <AppLoader :visible="loading" />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import AppLoader from '@/components/AppLoader.vue'

const props = defineProps({
  title: String,
  loading: Boolean
})

const router = useRouter()
const route = useRoute()
const role = ref('')
const menuOpen = ref(false)
const isTransitioning = ref(false)

const roleName = computed(() => {
  switch (role.value) {
    case 'admin':
      return 'Администратор'
    case 'lawyer':
      return 'Юрист'
    case 'accountant':
      return 'Бухгалтер'
    default:
      return 'Гость'
  }
})

onMounted(() => {
  role.value = localStorage.getItem('role') || 'гость'
})

const confirmLogout = () => {
  if (confirm('Вы действительно хотите выйти?')) {
    logout()
  }
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user_id')
  router.push('/login')
}

const isActive = (path) => {
  return route.path.startsWith(path)
}

// Smooth navigation handling
const smoothNavigate = (navigate, path) => {
  if (route.path === path) return // Don't navigate to the same route
  if (isTransitioning.value) return // Prevent navigation during transition

  isTransitioning.value = true
  navigate()
}

// Page transition hooks
const beforePageLeave = (el) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

const onPageEnter = (el) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

const afterPageEnter = (el) => {
  setTimeout(() => {
    el.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'

    // Reset transition state
    setTimeout(() => {
      isTransitioning.value = false
    }, 300)
  }, 50)
}
</script>

<style scoped>
/* Base transition classes for page transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Active navigation link styling */
.active-nav-link {
  position: relative;
}

.active-nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  height: 2px;
  background-color: currentColor;
  border-radius: 1px;
}
</style>