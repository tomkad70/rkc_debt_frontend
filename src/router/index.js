import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import AdminUserList from '../pages/AdminUserList.vue'

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage },
    {
        path: '/admin/users',
        component: AdminUserList,
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/dashboard',
        component: () => import('../pages/Dashboard.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/applications',
        component: () => import('../pages/ApplicationsList.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/organizations',
        component: () => import('../pages/AdminOrganizations.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/contracts',
        component: () => import('../pages/AdminContracts.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/admin/reports',
        component: () => import('../pages/AdminReports.vue'),
        meta: { requiresAuth: true }
    }
]



const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const userRole = localStorage.getItem('role')

    // если маршрут требует авторизации
    if (to.meta.requiresAuth && !token) {
        return next('/login')
    }

    // если маршрут требует конкретную роль
    if (to.meta.role && userRole !== to.meta.role) {
        return next('/dashboard') // редирект на безопасную страницу
    }

    next()
})

export default router
