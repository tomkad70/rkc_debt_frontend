import {reactive, computed, watch} from 'vue'
import api from '@/api'

/**
 * Composable для управления формой заявки
 *
 * @param {Object} props - Свойства компонента
 * @param {Function} emit - Функция для генерации событий
 * @returns {Object} Объект с данными и методами для работы с формой
 */
export function useApplicationForm(props, emit) {
    // Создаем реактивную копию переданного объекта заявки
    const form = reactive({
        ...(props.application || {}),
        // Установка дефолтных значений для полей, которые могут быть null/undefined
        debtor_address: props.application?.debtor_address || '',
        debtor_fias_id: props.application?.debtor_fias_id || '',
        application_date: props.application?.application_date || new Date().toISOString().split('T')[0],
        status: props.application?.status || 'новая',
        has_signature: props.application?.has_signature || false,
        has_documents: props.application?.has_documents || false,
        is_in_court: props.application?.is_in_court || false,
        ufssp_sent: props.application?.ufssp_sent || false,
        is_executed: props.application?.is_executed || false,
        // Инициализация массивов для этапов и услуг
        steps: props.application?.steps || [],
        services: props.application?.services || []
    })

    // Преобразуем строковые ID в числовые при необходимости
    const normalizeIds = () => {
        if (form.organization_id && typeof form.organization_id === 'string') {
            form.organization_id = parseInt(form.organization_id, 10)
        }

        if (form.user_id && typeof form.user_id === 'string') {
            form.user_id = parseInt(form.user_id, 10)
        }

        // Нормализация ID в услугах
        if (form.services && Array.isArray(form.services)) {
            form.services.forEach(service => {
                if (service.service_id && typeof service.service_id === 'string') {
                    service.service_id = parseInt(service.service_id, 10)
                }
            })
        }

        // Нормализация ID в этапах
        if (form.steps && Array.isArray(form.steps)) {
            form.steps.forEach(step => {
                if (step.step_id && typeof step.step_id === 'string') {
                    step.step_id = parseInt(step.step_id, 10)
                }
            })
        }
    }

    // Функция для отправки формы
    const submit = async () => {
        try {
            normalizeIds()

            // Копируем форму и обрабатываем данные
            const formData = {...form}

            // Обрабатываем services - убедимся, что service_id есть у каждой услуги
            if (formData.services && Array.isArray(formData.services)) {
                formData.services = formData.services.map(service => ({
                    // Используем service_id или id, если service_id не определен
                    service_id: service.service_id || service.id,
                    lawyer_price: service.lawyer_price || 0,
                    partner_price: service.partner_price || 0,
                    name: service.name // Добавляем для отображения
                }));
            }

            // Обрабатываем steps - убедимся, что step_id есть у каждого этапа
            if (formData.steps && Array.isArray(formData.steps)) {
                formData.steps = formData.steps.map(step => ({
                    // Используем step_id или id, если step_id не определен
                    step_id: step.step_id || step.id,
                    step_date: step.step_date || step.date || new Date().toISOString().split('T')[0],
                    name: step.name // Добавляем для отображения
                }));
            }

            const method = form.id ? 'put' : 'post'
            const url = form.id ? `/applications/${form.id}` : '/applications'

            console.log('Submitting form data:', form)

            await api[method](url, form)
            emit('updated')
            emit('close')
        } catch (err) {
            console.error('Error saving application:', err)
            alert('Ошибка при сохранении заявки')
        }
    }

    // Наблюдаем за изменениями props.application и обновляем форму
    watch(() => props.application, (newVal) => {
        if (newVal) {
            Object.assign(form, newVal)

            // Убедимся, что массивы для этапов и услуг инициализированы
            if (!form.steps) form.steps = []
            if (!form.services) form.services = []
        }
    }, {immediate: true, deep: true})

    // Вычисляемые значения для заголовков
    const formTitle = computed(() => form.id ? 'Редактировать заявку' : 'Новая заявка')
    const formSubtitle = computed(() => form.id ? 'Обновление информации о заявке' : 'Создание новой заявки в системе')
    const submitButtonText = computed(() => form.id ? 'Сохранить изменения' : 'Создать заявку')

    return {
        form,
        submit,
        normalizeIds,
        formTitle,
        formSubtitle,
        submitButtonText
    }
}