import { ref, computed, onMounted } from 'vue'
import api from '@/api'

/**
 * Composable для загрузки и управления данными об организациях и пользователях
 *
 * @param {Object} form - Реактивный объект формы
 * @returns {Object} Объект с данными и методами для работы с организациями и пользователями
 */
export function useOrganizationsAndUsers(form) {
    const organizations = ref([])
    const users = ref([])
    const contracts = ref([])
    const loading = ref(false)

    // Получаем роль пользователя
    const userRole = localStorage.getItem('role')
    const isAdmin = computed(() => userRole === 'admin')

    // Отфильтрованные пользователи только с ролью "lawyer"
    const lawyers = computed(() => {
        return users.value.filter(user => user.roles && user.roles.includes('lawyer'))
    })

    // Загрузка необходимых данных для выпадающих списков
    const loadData = async () => {
        loading.value = true
        try {
            const [orgsRes, usersRes,contractsRes] = await Promise.all([
                api.get('/organizations'),
                api.get('/users'),
                api.get('/contracts')
            ])

            organizations.value = orgsRes.data.data || orgsRes.data
            users.value = usersRes.data.data || usersRes.data
            contracts.value = contractsRes.data.data || contractsRes.data;

            // Если это новая заявка и администратор - установим организацию и юриста по умолчанию
            if (!form.id && organizations.value.length > 0 && !form.organization_id) {
                form.organization_id = organizations.value[0].id
            }

            if (!form.id && lawyers.value.length > 0 && !form.user_id) {
                form.user_id = lawyers.value[0].id
            }
        } catch (error) {
            console.error('Failed to load form data:', error)
        } finally {
            loading.value = false
        }
    }

    // Загружаем данные при инициализации composable
    onMounted(async () => {
        await loadData()
    })

    return {
        organizations,
        users,
        lawyers,
        contracts,
        loading,
        isAdmin,
        loadData
    }
}