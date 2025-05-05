import { ref, reactive, computed } from 'vue'
import api from '@/api'

/**
 * Composable for managing applications data, filtering, and loading
 *
 * @returns {Object} Applications data and methods
 */
export function useApplications() {
    // Data
    const applications = ref([])
    const registries = ref([])
    const organizations = ref([])
    const users = ref([])

    // Loading states
    const loading = ref(true)
    const selectedLoading = ref(false)

    // Statistics
    const totalApplications = ref(0)
    const activeApplications = ref(0)

    // Selected application for detail view/edit
    const selected = ref(null)

    // Filters with multi-select support for statuses
    const filters = reactive({
        registry_id: '',
        organization_id: '',
        statuses: [],
        user_id: ''
    })

    // Computed properties
    const hasActiveFilters = computed(() => {
        return filters.registry_id !== '' ||
            filters.organization_id !== '' ||
            filters.statuses.length > 0 ||
            filters.user_id !== ''
    })

    const lawyerUsers = computed(() => {
        return users.value.filter(user => user.roles && user.roles.includes('lawyer'))
    })

    // Get role from localStorage
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('user_id')

    /**
     * Load reference data (organizations, registries, users)
     */
    const loadReferenceData = async () => {
        try {
            const [orgsRes, regsRes, usersRes] = await Promise.all([
                api.get('/organizations'),
                api.get('/registries'),
                api.get('/users')
            ])

            organizations.value = orgsRes.data.data || orgsRes.data
            registries.value = regsRes.data.data || regsRes.data
            users.value = usersRes.data.data || usersRes.data
        } catch (error) {
            console.error('Failed to load reference data:', error)
        }
    }

    /**
     * Load applications with applied filters
     */
    const loadApplications = async () => {
        loading.value = true

        try {
            // Format parameters for API request
            const params = new URLSearchParams()

            if (filters.registry_id) params.append('registry_id', filters.registry_id)
            if (filters.organization_id) params.append('organization_id', filters.organization_id)

            // Handle multi-select status filters
            if (filters.statuses && filters.statuses.length > 0) {
                // If not all statuses are selected, add them as multiple parameters
                filters.statuses.forEach(status => {
                    params.append('statuses[]', status)
                })
            }

            if (filters.user_id) params.append('user_id', filters.user_id)

            const url = `/applications${params.toString() ? `?${params.toString()}` : ''}`
            const response = await api.get(url)
            applications.value = response.data.data || response.data

            // Update statistics
            await getStatistics()

        } catch (error) {
            console.error('Failed to load applications:', error)
        } finally {
            loading.value = false
        }
    }

    /**
     * Get application statistics
     */
    const getStatistics = async () => {
        try {
            const response = await api.get('/applications/stats')
            if (response.data) {
                totalApplications.value = response.data.total || 0
                activeApplications.value = response.data.active || 0
            } else {
                // Calculate locally if API doesn't support
                totalApplications.value = applications.value.length
                activeApplications.value = applications.value.filter(app => app.status !== 'закрыта').length
            }
        } catch (error) {
            console.error('Failed to load statistics:', error)
            // Calculate locally on error
            totalApplications.value = applications.value.length
            activeApplications.value = applications.value.filter(app => app.status !== 'закрыта').length
        }
    }

    /**
     * Clear a specific filter
     * @param {string} filterName - Name of the filter to clear
     */
    const clearFilter = (filterName) => {
        if (filterName === 'statuses') {
            filters[filterName] = []
        } else {
            filters[filterName] = ''
        }
        loadApplications()
    }

    /**
     * Reset all filters
     */
    const resetFilters = () => {
        filters.registry_id = ''
        filters.organization_id = ''
        filters.statuses = []
        filters.user_id = ''
        loadApplications()
    }

    /**
     * Open application for editing
     * @param {Object} app - Application data
     */
    const openEdit = async (app) => {
        try {
            selectedLoading.value = true

            // Load full application data
            const response = await api.get(`/applications/${app.id}`)
            const fullApplication = response.data.data || response.data

            // Restore organization_id if missing
            if (fullApplication.organization && !fullApplication.organization_id) {
                const matchingOrg = organizations.value.find(
                    org => org.name === fullApplication.organization
                )
                if (matchingOrg) {
                    fullApplication.organization_id = matchingOrg.id
                }
            }

            // Restore user_id if missing
            if (fullApplication.lawyer && !fullApplication.user_id) {
                const matchingLawyer = users.value.find(
                    user => user.name === fullApplication.lawyer
                )
                if (matchingLawyer) {
                    fullApplication.user_id = matchingLawyer.id
                }
            }

            // Initialize empty arrays if needed
            if (!fullApplication.services) fullApplication.services = []
            if (!fullApplication.steps) fullApplication.steps = []

            selected.value = fullApplication
        } catch (error) {
            console.error('Failed to load application details:', error)
            alert('Не удалось загрузить данные заявки. Попробуйте еще раз.')
        } finally {
            selectedLoading.value = false
        }
    }

    /**
     * Create a new application
     */
    const createNew = () => {
        selected.value = {
            id: null,
            status: 'новая',
            application_date: new Date().toISOString().split('T')[0],
            user_id: role === 'lawyer' ? userId : null,
            steps: [],
            services: []
        }
    }

    /**
     * Get CSS class for status badge
     * @param {string} status - Status value
     * @returns {string} CSS class
     */
    const getStatusBadgeClass = (status) => {
        const statusClasses = {
            'новая': 'bg-blue-100 text-blue-800',
            'в работе': 'bg-yellow-100 text-yellow-800',
            'закрыта': 'bg-green-100 text-green-800'
        }

        return status ? statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800' : 'bg-gray-100 text-gray-500'
    }

    /**
     * Format date to localized string
     * @param {string} dateString - Date string
     * @returns {string} Formatted date
     */
    const formatDate = (dateString) => {
        if (!dateString) return '—'

        try {
            const date = new Date(dateString)
            return new Intl.DateTimeFormat('ru-RU').format(date)
        } catch (e) {
            console.error('Invalid date:', dateString, e)
            return dateString || '—'
        }
    }

    /**
     * Helper functions for lookup data
     */
    const getRegistryNumber = (registryId) => {
        const registry = registries.value.find(r => String(r.id) === String(registryId))
        return registry ? registry.number : '—'
    }

    const getOrganizationName = (orgId) => {
        const org = organizations.value.find(o => String(o.id) === String(orgId))
        return org ? org.name : '—'
    }

    const getUserName = (userId) => {
        const user = users.value.find(u => String(u.id) === String(userId))
        return user ? user.name : '—'
    }

    return {
        // Data
        applications,
        registries,
        organizations,
        users,
        loading,
        selectedLoading,
        selected,
        filters,
        totalApplications,
        activeApplications,
        role,

        // Computed
        hasActiveFilters,
        lawyerUsers,

        // Methods
        loadReferenceData,
        loadApplications,
        getStatistics,
        clearFilter,
        resetFilters,
        openEdit,
        createNew,
        getStatusBadgeClass,
        formatDate,
        getRegistryNumber,
        getOrganizationName,
        getUserName
    }
}