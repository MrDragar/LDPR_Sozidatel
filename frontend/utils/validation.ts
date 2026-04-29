import type { FormData } from '../types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^https?:\/\/([a-zA-Z0-9\u0400-\u04FF.-]+)\.([a-zA-Z\u0400-\u04FF]{2,})([\/\w .-]*)*\/?$/;
const DATE_REGEX = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.(19|20)\d\d$/;
const CYRILLIC_NAME_REGEX = /^[А-Яа-яЁё\s-]+$/;

export const validateField = (name: string, allData: Record<string, any>): string | undefined => {
    const value = allData[name];

    switch (name) {
        case 'lastName':
        case 'firstName':
            if (!value) return 'Поле обязательно';
            if (!CYRILLIC_NAME_REGEX.test(value as string)) return 'Допускаются только русские буквы и дефис';
            return undefined;
        case 'patronymic':
            if (value && String(value).trim() !== '' && !CYRILLIC_NAME_REGEX.test(value as string)) {
                return 'Допускаются только русские буквы и дефис';
            }
            return undefined;
        case 'birthDate':
            if (!value) return 'Поле обязательно';
            if (!DATE_REGEX.test(value as string)) return 'Введите дату в формате ДД.ММ.ГГГГ (например, 15.05.1990)';
            
            // Check for valid calendar date and strictly past date
            const parts = (value as string).split('.');
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            
            const dateObj = new Date(year, month, day);
            const today = new Date();
            
            // Re-validate to ensure Javascript didn't "roll over" invalid dates like 31.02.1990 to March
            if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month || dateObj.getDate() !== day) {
                return 'Введите существующую дату';
            }
            
            // Future date check
            if (dateObj >= today) {
                return 'Дата рождения не может быть в будущем';
            }
            
            return undefined;
        case 'email':
            if (!value) return 'Поле обязательно';
            return EMAIL_REGEX.test(value as string) ? undefined : 'Неверный формат email';
        case 'website':
            if (!value) return undefined;
            return URL_REGEX.test(value as string) ? undefined : 'Неверный формат ссылки. Пример: https://example.com';
        case 'phone':
            if (!value) return 'Поле обязательно';
            const phoneDigits = String(value).replace(/\D/g, '');
            if (phoneDigits.length < 11) return 'Введите номер телефона полностью';
            return undefined;
        case 'ogrn':
            if (!value) return 'Поле обязательно';
            const ogrnLength = String(value).length;
            if (ogrnLength !== 13 && ogrnLength !== 15) {
                return 'ОГРН должен состоять из 13 или 15 цифр';
            }
            return undefined;
        case 'agreement1':
        case 'agreement2':
            return value ? undefined : 'Необходимо ваше согласие';
        default:
            // Generic fallback for required fields
            if (value === undefined || value === null || String(value).trim() === '') {
                return 'Поле обязательно';
            }
            return undefined;
    }
};