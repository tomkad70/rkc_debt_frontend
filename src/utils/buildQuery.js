// utils/buildQuery.js
export function buildQueryParams(filters) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        // пропускаем «пустые» фильтры
        if (
            value === '' ||
            value == null ||
            (Array.isArray(value) && value.length === 0)
        ) return;

        if (Array.isArray(value)) {
            // status: ['новая','закрыта'] → status[]=новая&status[]=закрыта
            value.forEach(v => params.append(`${key}[]`, v));
        } else {
            params.append(key, value);
        }
    });
    return params.toString();
}
