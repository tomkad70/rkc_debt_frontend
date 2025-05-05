// src/dadata.js
import axios from 'axios';

export const dadata = axios.create({
    baseURL: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Ваш ключ из примера
        'Authorization': 'Token eb5b17e1c4338b3d94a15eb5da286c355161115e'
    }
});
