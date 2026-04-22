import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lightbulb, TrendingUp, Users, Target, Send, Loader2, AlertCircle, X, Plug2, Check } from 'lucide-react';
import TextInput from '../components/TextInput';
import NumberInput from '../components/NumberInput';
import SearchableSelect from '../components/SearchableSelect';
import RadioGroup from '../components/RadioGroup';
import BooleanToggle from '../components/BooleanToggle';
import NominationCards from '../components/NominationCards';
import { REGIONS, NOMINATIONS_LIST } from '../constants';
import { validateField } from '../utils/validation';
import type { FormData } from '../types';

import SuccessPage from './SuccessPage';

const INITIAL_DATA: FormData = {
    lastName: '',
    firstName: '',
    patronymic: '',
    gender: '',
    birthDate: '',
    phone: '',
    email: '',
    city: '',
    region: '',
    isMember: null,
    wishToJoin: null,
    homeAddress: '',
    newsSubscription: null,
    organization: '',
    industry: '',
    ogrn: '',
    website: '',
    nominationId: '',
    agreement1: false,
    agreement2: false
};

const DYNAMIC_QUESTIONS: Record<string, string[]> = {
    proryv: [
        "Опишите технологию или продукт простым языком. В чём конкретно заключается новизна — для России или для мира? Чем ваше решение принципиально отличается от того, что уже существует на рынке?",
        "Проводились ли собственные НИОКР (научно-исследовательские и опытно-конструкторские работы)? Есть ли патенты, ноу-хау или другие документы, подтверждающие авторство и уникальность разработки?",
        "Технология уже внедрена в производство или находится на стадии опытного образца? Какой конкретный эффект получен или ожидается — например, рост производительности, снижение себестоимости, повышение качества, решение ранее неразрешимой задачи?"
    ],
    importozameschenie: [
        "Какой конкретно зарубежный продукт, технологию или компонент вы замещаете своим решением? Укажите страну производителя и название замещаемого аналога (если это публичная информация). Почему потребители выбирают вас вместо импорта?",
        "Каков реальный уровень локализации вашего продукта в процентах от себестоимости или по ключевым компонентам? Что именно в вашем изделии пока остаётся импортным, и есть ли план по его замещению в ближайшие 1-2 года?",
        "Были ли случаи, когда благодаря вам предприятия избежали остановки производства из-за санкций или разрыва логистических цепочек? Есть ли примеры, когда заказчики после тестирования вашего решения полностью отказались от импорта в вашу пользу?"
    ],
    rost: [
        "Что именно произошло за последние несколько лет: вы запустили в серию принципиально новую продукцию или расширили физические возможности производства (новые цеха, линии, склады)? Опишите конкретно — что именно, где и когда было запущено или построено.",
        "Какой объём средств был вложен в этот рост? Сколько новых рабочих мест создано благодаря запуску новой продукции или расширению площадей?",
        "Какую долю в выручке компании сегодня занимает новая продукция или насколько вырос общий объём производства после расширения площадей? Кто основные потребители и в каких регионах (включая экспорт) представлена эта продукция?"
    ],
    export: [
        "На какие новые зарубежные рынки ваша компания вышла за последние 2 года? Почему выбрали именно эти страны и каким способом организовали выход — через дистрибьюторов, собственное представительство, маркетплейсы, участие в международных тендерах?",
        "Пришлось ли адаптировать продукт под требования нового рынка — сертификация, упаковка, маркировка, технические регламенты? Есть ли подтверждение признания продукции за рубежом: местные сертификаты, победы в тендерах, отзывы иностранных заказчиков?",
        "Какую долю в общей выручке компании сегодня занимает экспорт? Насколько это направление устойчиво в текущих геополитических и санкционных условиях, и планируете ли дальнейшее расширение географии поставок?"
    ],
    capital: [
        "Какие программы материальной поддержки, выходящие за рамки обычной зарплаты и предусмотренных ТК РФ выплат, действуют на предприятии?",
        "Как компания помогает сотрудникам с детьми, а также заботится о здоровье коллектива?",
        "Есть ли на предприятии практики, направленные на снижение текучести кадров и создание «своей» атмосферы?"
    ],
    svoih: [
        "Какие конкретные меры поддержки получают сотрудники, призванные в рамках частичной мобилизации или ушедшие добровольцами на СВО, а также их семьи?",
        "Принимаете ли вы на работу ветеранов боевых действий, вернувшихся со СВО? Если да, то сколько человек трудоустроено за последние 1-2 года и какие условия созданы для их адаптации?",
        "Участвует ли предприятие в сборе и отправке гуманитарной помощи в зону СВО или приграничные регионы? Расскажите об этой деятельности."
    ]
};

const VELICHIE_OPTIONS = [
    "Предложения / проекты по развитию экономики своего региона / города / села",
    "Предложения и законопроекты в экономическую Программу ЛДПР"
];

const VELICHIE_SPHERES = [
    "Развитие производства",
    "Транспорт и развитие дорожной инфраструктуры",
    "Строительная отрасль",
    "Агропромышленный комплекс",
    "Поддержка сельской торговли",
    "IT-индустрия",
    "Креативные индустрии",
    "Телекоммуникации"
];

const formatPhone = (val: string) => {
    if (!val) return '';
    const isPlus = val.startsWith('+');
    const cleaned = val.replace(/\D/g, '');
    
    if (cleaned.length === 0) return isPlus ? '+' : '';
    
    let body = cleaned;
    let prefix = '';
    
    if (cleaned[0] === '7') {
        prefix = '+7';
        body = cleaned.slice(1);
    } else if (cleaned[0] === '8') {
        prefix = isPlus ? '+8' : '8'; 
        body = cleaned.slice(1);
    } else {
        prefix = '+7';
    }
    
    let res = prefix;
    if (body.length > 0) res += ' (' + body.slice(0, 3);
    if (body.length >= 4) res += ') ' + body.slice(3, 6);
    if (body.length >= 7) res += '-' + body.slice(6, 8);
    if (body.length >= 9) res += '-' + body.slice(8, 10);
    return res;
};

interface RegistrationState {
    id: string;
    link: string;
    isActivated: boolean;
    surname: string;
    name: string;
    patronymic?: string;
    gender?: string;
    nomination: string;
}

const RegistrationPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData>(() => {
        const storedForm = localStorage.getItem('ldpr_form_data');
        if (storedForm) {
            try {
                const parsed = JSON.parse(storedForm);
                if (parsed && typeof parsed === 'object') {
                    return { ...INITIAL_DATA, ...parsed };
                }
            } catch (e) {
                console.error("Could not parse ldpr_form_data", e);
            }
        }
        return INITIAL_DATA;
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [registrationState, setRegistrationState] = useState<RegistrationState | null>(null);
    const [justActivated, setJustActivated] = useState(false);
    
    // Auto-hide API Error
    useEffect(() => {
        if (apiError) {
            const timer = setTimeout(() => {
                setApiError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [apiError]);

    // Save formData to local storage
    useEffect(() => {
        localStorage.setItem('ldpr_form_data', JSON.stringify(formData));
    }, [formData]);
    
    // Load from local storage on mount
    useEffect(() => {
        const stored = localStorage.getItem('ldpr_application_data');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed && typeof parsed.id === 'string') {
                    setRegistrationState(parsed);
                }
            } catch (e) {
                console.error("Could not parse local storage application data", e);
            }
        }
    }, []);

    // Polling is_activated endpoint
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        const checkActivation = async () => {
            if (!registrationState || registrationState.isActivated) return;
            
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'https://созидательлдпр.рф';
                const response = await fetch(`${baseUrl}/api/users/${registrationState.id}/is_activated`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.is_activated) {
                        const updatedState = { ...registrationState, isActivated: true };
                        setRegistrationState(updatedState);
                        localStorage.setItem('ldpr_application_data', JSON.stringify(updatedState));
                        setJustActivated(true);
                    }
                }
            } catch (error) {
                console.error("Polling error:", error);
            }
        };

        if (registrationState && !registrationState.isActivated) {
            checkActivation(); // immediate check
            intervalId = setInterval(checkActivation, 5000); // repeat every 5 seconds
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [registrationState]);

    // Auto-scroll to first error handler
    const scrollToError = () => {
        setTimeout(() => {
            const firstErrorEl = document.querySelector('.text-red-600');
            if (firstErrorEl) {
                firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    const handleChange = useCallback((name: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev };
            
            if (name === 'phone') {
                newData[name] = formatPhone(value);
            } else if (name === 'nominationId') {
                newData[name] = value;
                // Only clear validation errors for dynamic fields, do not wipe data from state
                setErrors(e => {
                    const nextErrors = { ...e };
                    ['dynamic0', 'dynamic1', 'dynamic2', 'velichieChoice', 'velichieSphere', 'velichieProposal'].forEach(k => delete nextErrors[k]);
                    return nextErrors;
                });
            } else {
                newData[name] = value;
            }
            return newData;
        });
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }, [errors]);

    const handleBlur = useCallback((name: string) => {
        const error = validateField(name, formData);
        setErrors(prev => ({ ...prev, [name]: error || '' }));
    }, [formData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newErrors: Record<string, string> = {};
        const fieldsToValidate = [
            'lastName', 'firstName', 'patronymic', 'gender', 'birthDate', 'phone', 'email', 'city', 'region',
            'isMember', 'newsSubscription',
            'organization', 'industry', 
            'ogrn', 'website', 'nominationId', 
            'agreement1', 'agreement2'
        ];

        if (formData.isMember === false) {
            fieldsToValidate.push('wishToJoin');
        }

        if (formData.isMember === true || formData.wishToJoin === true) {
            fieldsToValidate.push('homeAddress');
        }

        // Add dynamic fields depending on nomination
        if (formData.nominationId === 'velichie') {
            fieldsToValidate.push('velichieChoice');
            if (formData.velichieChoice === VELICHIE_OPTIONS[1]) {
                fieldsToValidate.push('velichieSphere');
            }
            if (formData.velichieChoice) {
                fieldsToValidate.push('velichieProposal');
            }
        } else if (formData.nominationId && DYNAMIC_QUESTIONS[formData.nominationId]) {
            fieldsToValidate.push('dynamic0', 'dynamic1', 'dynamic2');
        }

        let hasError = false;
        fieldsToValidate.forEach(field => {
            const err = validateField(field, formData);
            if (err) {
                newErrors[field] = err;
                hasError = true;
            }
        });

        setErrors(newErrors);

        if (hasError) {
            scrollToError();
            return;
        }

        // Process phone into an integer starting with 8
        let processedPhoneStr = formData.phone.replace(/\D/g, '');
        if (processedPhoneStr.startsWith('7')) {
            processedPhoneStr = '8' + processedPhoneStr.substring(1);
        } else if (processedPhoneStr.length === 10 && !processedPhoneStr.startsWith('8')) {
            processedPhoneStr = '8' + processedPhoneStr;
        } else if (processedPhoneStr.length > 0 && !processedPhoneStr.startsWith('8')) {
            // Fallback: forcefully ensure it starts with 8
            processedPhoneStr = '8' + processedPhoneStr.substring(1);
        }
        const phoneInt = parseInt(processedPhoneStr, 10);

        // Format dates and numbers for API payload
        const [day, month, year] = formData.birthDate.split('.');
        const birthDateApi = `${year}-${month}-${day}`;
        const phoneStr = String(phoneInt);
        const ogrnInt = parseInt(formData.ogrn, 10) || 0;

        // Generate JSON
        const payload: Record<string, any> = {
            surname: formData.lastName,
            name: formData.firstName,
            patronymic: formData.patronymic || null,
            gender: formData.gender,
            birth_date: birthDateApi,
            phone_number: phoneStr,
            email: formData.email,
            region: formData.region,
            city: formData.city,
            is_member: formData.isMember,
            wish_to_join: formData.wishToJoin || false,
            home_address: formData.homeAddress || null,
            news_subscription: formData.newsSubscription,
            organization: formData.organization,
            industry: formData.industry,
            ogrn: ogrnInt,
            website: formData.website || "",
            nomination: NOMINATIONS_LIST.find(n => n.id === formData.nominationId)?.title || formData.nominationId,
            answer1: null,
            answer2: null,
            answer3: null,
        };

        if (formData.nominationId === 'velichie') {
            payload.answer1 = formData.velichieChoice || null;
            if (formData.velichieChoice === VELICHIE_OPTIONS[1]) {
                payload.answer2 = formData.velichieSphere || null;
            }
            payload.answer3 = formData.velichieProposal || null;
        } else if (formData.nominationId && DYNAMIC_QUESTIONS[formData.nominationId]) {
            payload.answer1 = formData.dynamic0 || null;
            payload.answer2 = formData.dynamic1 || null;
            payload.answer3 = formData.dynamic2 || null;
        }

        submitToApi(payload);
    };

    const submitToApi = async (payload: any) => {
        setIsSubmitting(true);
        setApiError(null);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'https://созидательлдпр.рф';
            const response = await fetch(`${baseUrl}/api/users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        setApiError("Ошибка заполнения формы: " + errorData.detail.map((err: any) => err.msg).join(', '));
                    } else if (typeof errorData.detail === 'string') {
                        setApiError(errorData.detail);
                    } else {
                        setApiError("Произошла ошибка при отправке (400).");
                    }
                } else {
                    setApiError("Произошла серверная ошибка.");
                }
                setIsSubmitting(false);
                return;
            }

            const data = await response.json();
            
            const newState: RegistrationState = {
                id: data.id,
                link: data.link,
                isActivated: false,
                surname: payload.surname,
                name: payload.name,
                patronymic: payload.patronymic || undefined,
                gender: payload.gender,
                nomination: payload.nomination
            };
            
            localStorage.setItem('ldpr_application_data', JSON.stringify(newState));
            setRegistrationState(newState);
            setIsSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'auto' });
        } catch (err) {
            setApiError("Не удалось подключиться к серверу. Пожалуйста, проверьте подключение к интернету.");
            setIsSubmitting(false);
        }
    };

    if (registrationState && !registrationState.isActivated) {
        return (
            <div className="min-h-[100dvh] bg-gradient-to-br from-[#11236B] via-[#0d1b54] to-[#081033] font-sans text-white p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center relative">
                <div className="max-w-xl w-full bg-transparent sm:bg-white/5 border border-transparent sm:border-white/10 p-4 sm:p-12 rounded-3xl sm:shadow-2xl text-center backdrop-blur-sm">
                    <div className="h-24 w-24 bg-[#11236B] shadow-inner rounded-full flex items-center justify-center mx-auto mb-8 text-white border-2 border-white/20">
                        <Plug2 className="h-10 w-10 flex-shrink-0" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-6 font-sans">Подтвердите участие</h2>
                    <p className="text-lg text-gray-300 mb-10 leading-relaxed font-sans">
                        Мы получили вашу анкету. Для завершения регистрации, пожалуйста, перейдите в наш Telegram-бот и подтвердите заявку.
                    </p>
                    <div className="flex flex-col gap-4 mt-8">
                        <a 
                            href={registrationState.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center bg-[#0088cc] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#0077b5] transition shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
                        >
                            Перейти в Telegram
                        </a>
                    </div>
                    
                    <div className="mt-10 pt-8 border-t border-white/10 flex items-start justify-center text-gray-400 gap-3 text-left">
                        <Loader2 className="h-5 w-5 animate-spin shrink-0 mt-0.5" />
                        <span className="font-medium text-base">Ожидаем подтверждение...</span>
                    </div>
                </div>
            </div>
        );
    }
    
    if (justActivated && registrationState) {
        return (
            <SuccessPage 
                surname={registrationState.surname || formData.lastName}
                name={registrationState.name || formData.firstName}
                patronymic={registrationState.patronymic || formData.patronymic}
                gender={registrationState.gender || formData.gender}
                nomination={registrationState.nomination || formData.nominationId}
            />
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-[#11236B] via-[#0d1b54] to-[#081033] font-sans text-white pb-20 relative">
            {apiError && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:-translate-x-0 sm:translate-y-0 z-[100] w-[90%] sm:w-auto max-w-sm animate-in fade-in slide-in-from-top-5 duration-300">
                    <div className="bg-red-600 text-white px-5 py-4 rounded-xl shadow-2xl flex items-start gap-3 w-full border border-red-500/50">
                        <AlertCircle className="h-6 w-6 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-bold text-base">Ошибка отправки</p>
                            <p className="text-sm mt-1 text-red-100">{apiError}</p>
                        </div>
                        <button 
                            onClick={() => setApiError(null)} 
                            className="shrink-0 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
            
            <style>{`
                .dark-theme-overrides label, 
                .dark-theme-overrides p, 
                .dark-theme-overrides span, 
                .dark-theme-overrides h2 {
                    color: white !important;
                }
                .dark-theme-overrides input,
                .dark-theme-overrides textarea,
                .dark-theme-overrides select {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    color: white !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    box-shadow: none !important;
                }
                .dark-theme-overrides input::placeholder,
                .dark-theme-overrides textarea::placeholder {
                    color: rgba(255, 255, 255, 0.4) !important;
                }
                .dark-theme-overrides .text-red-600, .dark-theme-overrides .text-red-500 {
                    color: #fca5a5 !important;
                }
                .dark-theme-overrides .bg-white {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                }
                .dark-theme-overrides .text-\\[\\#11236B\\] {
                    color: white !important;
                }
                .dark-theme-overrides .text-gray-500,
                .dark-theme-overrides .text-gray-600 {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
                .dark-theme-overrides .border-\\[\\#11236B\\] {
                    border-color: white !important;
                }
                .dark-theme-overrides .ring-\\[\\#11236B\\] {
                    --tw-ring-color: white !important;
                }
                .dark-theme-overrides .bg-blue-50\\/50 {
                    background-color: rgba(255, 255, 255, 0.15) !important;
                }
                .dark-theme-overrides input[type="checkbox"] {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                }
                .dark-theme-overrides input[type="radio"]:checked {
                    background-color: white !important;
                    border-color: white !important;
                }
                .dark-theme-overrides input[type="radio"] {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    border-color: rgba(255, 255, 255, 0.3) !important;
                }
                .dark-theme-overrides .radio-dot {
                    background-color: white !important;
                    border-color: white !important;
                }

                /* Экземпшены для выпадающего списка "Регион" на ПК */
                .dark-theme-overrides .searchable-dropdown-pc {
                    background-color: #11236B !important;
                    border-color: rgba(255, 255, 255, 0.2) !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
                    border-radius: 0.75rem !important;
                }
                .dark-theme-overrides .searchable-dropdown-pc input {
                    background-color: #0d1b54 !important;
                    color: white !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                    border-radius: 0.5rem !important;
                }
                .dark-theme-overrides .searchable-dropdown-pc input::placeholder {
                    color: rgba(255, 255, 255, 0.5) !important;
                }
                .dark-theme-overrides .searchable-dropdown-pc li {
                    color: white !important;
                    background-color: transparent !important;
                }
                .dark-theme-overrides .searchable-dropdown-pc li:hover {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                }
                .dark-theme-overrides .searchable-dropdown-pc li.selected {
                    background-color: rgba(255, 255, 255, 0.15) !important;
                    color: white !important;
                    font-weight: 600;
                }
                
                /* Exceptions for Success Block to render exactly like first screenshot */
                .dark-theme-overrides .dark-theme-block-exception * {
                    color: inherit !important;
                    background-color: inherit !important;
                }
                .dark-theme-overrides .dark-theme-block-exception {
                    color: #1e293b !important;
                    background-color: white !important;
                    border: none !important;
                }
                .dark-theme-overrides .dark-theme-block-exception h1 {
                    color: #1e293b !important;
                }
                .dark-theme-overrides .dark-theme-block-exception .bg-green-500,
                .dark-theme-overrides .dark-theme-block-exception .bg-green-500 * {
                    background-color: #22c55e !important;
                    color: white !important;
                }
                .dark-theme-overrides .dark-theme-block-exception .bg-slate-50,
                .dark-theme-overrides .dark-theme-block-exception .bg-slate-50 * {
                    background-color: #f8fafc !important;
                }
                .dark-theme-overrides .dark-theme-block-exception .text-slate-700 { color: #334155 !important; }
                .dark-theme-overrides .dark-theme-block-exception .text-gray-900 { color: #111827 !important; }
                .dark-theme-overrides .dark-theme-block-exception .text-slate-500 { color: #64748b !important; }
                .dark-theme-overrides .dark-theme-block-exception .text-blue-700 { color: #1d4ed8 !important; }
                .dark-theme-overrides .dark-theme-block-exception hr { border-top: 1px solid #e5e7eb !important; border-bottom: none !important; }

                /* Custom Scrollbar for Region Dropdown */
                .region-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .region-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                    margin-bottom: 8px;
                    margin-top: 4px;
                }
                .region-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .region-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(255, 255, 255, 0.3);
                }
            `}</style>
            {/* СЕКЦИЯ 1: Hero-блок (Картинка на 100% ширины) */}
            <div className="w-full mb-10 md:mb-14 shadow-2xl">
                <img 
                    src="https://psv4.userapi.com/s/v1/d2/NhL__mhu0R8cGXj_TGsThHuhacoSEH_FUwC_6E-R4o5raIPz1CzYfsA0-xhBczDNNI1h57X5_9Yu4Urz7rrl4Pw3pO6PY6FhfpGDFj4QDkCvyJPRjlxNFXszGJIHwQ7QAe7hxD1iQSt6/photo_5208576917001855022_y.jpg" 
                    alt="Премия Созидатель" 
                    className="w-full h-auto md:aspect-[21/9] md:object-cover block"
                    referrerPolicy="no-referrer"
                />
            </div>

            <div className="max-w-4xl mx-auto px-4 md:px-6">
                {/* СЕКЦИЯ 1: Заголовок и Текст */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-left text-white mb-6 tracking-tight">
                    Премия «Созидатель»
                </h1>
                
                <div className="w-[15%] max-w-[100px] border-b-[6px] border-[#ed8a19] mb-8"></div>

                <p className="text-lg md:text-xl text-blue-100 leading-relaxed mb-6 text-left font-medium">
                    Всероссийская национальная премия для компаний и предпринимателей, которые производят инновационный продукт, применяют собственные новаторские технологии, вкладываются в науку и импортозамещение. Награждаем лучших, которые вносят реальный вклад в экономику!
                </p>

                {/* СЕКЦИЯ 2: Подзаголовок */}
                <h2 className="text-xl md:text-2xl font-bold text-left text-white mb-16 leading-snug">
                    III Всероссийская национальная премия за вклад в развитие экономики.
                </h2>
                
                {/* СЕКЦИЯ 3: Объединенный белый блок "Цель" и "Приоритеты" */}
                <div className="bg-white text-[#11236B] rounded-[2rem] p-8 md:p-12 mb-16 shadow-xl">
                    <div>
                        <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#11236B]">Цель премии</h3>
                        <p className="text-[#11236B] text-lg md:text-xl leading-relaxed">
                            Выявление и поддержка российских предпринимателей, которые вкладываются в развитие технологий и инновации, демонстрируют экономические достижения и придерживаются высоких стандартов управления.
                        </p>
                    </div>

                    <hr className="border-gray-300 my-10 border-t-2" />

                    <div>
                        <h3 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#11236B]">
                            Приоритеты
                        </h3>
                        <p className="text-xl md:text-2xl font-medium mb-10 text-[#11236B]">
                            Заявителям необходимо рассказать о своей продукции и компании следующее:
                        </p>
                        
                        <div className="flex flex-col">
                            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5 border-b border-gray-200 pb-8 mb-8">
                                <div className="shrink-0 w-14 h-14 bg-[#11236B] rounded-2xl flex items-center justify-center text-white shadow-md">
                                    <Lightbulb size={28} strokeWidth={2} />
                                </div>
                                <div className="mt-1 md:mt-0">
                                    <h4 className="text-xl md:text-2xl font-bold mb-2 text-[#11236B]">Технологии</h4>
                                    <p className="text-[#11236B] text-lg leading-relaxed">
                                        Технологические особенности продукта, его новизна, технологический эффект от использования, объёмы исследовательских работ в компании.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5 border-b border-gray-200 pb-8 mb-8">
                                <div className="shrink-0 w-14 h-14 bg-[#11236B] rounded-2xl flex items-center justify-center text-white shadow-md">
                                    <TrendingUp size={28} strokeWidth={2} />
                                </div>
                                <div className="mt-1 md:mt-0">
                                    <h4 className="text-xl md:text-2xl font-bold mb-2 text-[#11236B]">Экономика</h4>
                                    <p className="text-[#11236B] text-lg leading-relaxed">
                                        Экономические достижения за 3 года, выход на новые рынки, повышение производительности, получение патентов и лицензий.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-5">
                                <div className="shrink-0 w-14 h-14 bg-[#11236B] rounded-2xl flex items-center justify-center text-white shadow-md">
                                    <Users size={28} strokeWidth={2} />
                                </div>
                                <div className="mt-1 md:mt-0">
                                    <h4 className="text-xl md:text-2xl font-bold mb-2 text-[#11236B]">Управление</h4>
                                    <p className="text-[#11236B] text-lg leading-relaxed">
                                        Стандарты управления, развитие деловой репутации, вклад в человеческий потенциал, корпоративная культура и ответственность.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* СЕКЦИЯ 4: Галерея / Призыв */}
                <div className="mb-20 relative mix-blend-normal">
                    <img 
                        src="https://psv4.userapi.com/s/v1/d2/LfrWySc4mVAIumBB6avwt6WdIoVCqkb3m8dkU1HGQ218iwAnp15aA5et1gvrSXf8GelPC6VgZUSVGDFSYTkxB-v3Qh_FExEnRNzdDdrzVZqbWLSzcj1A7m_by3s3e_aNFe2S229btYPi/photo_5208576917001855031_y.jpg" 
                        alt="Совет предпринимателей" 
                        className="w-full aspect-[4/3] md:aspect-video rounded-3xl object-cover shadow-2xl mb-8 relative z-10 block"
                        referrerPolicy="no-referrer"
                    />
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 shadow-xl relative z-10 w-full overflow-hidden block">
                        <p className="text-lg md:text-xl leading-relaxed text-white font-medium break-words text-center md:text-left">
                            Заявителей, номинантов и лауреатов Премии приглашаем к участию в Совете предпринимателей при фракции ЛДПР в Государственной Думе для внесения предложений в законодательную повестку.
                        </p>
                    </div>
                </div>

                {/* СЕКЦИЯ 5: Форма или Успех */}
                <div className="mt-20 dark-theme-overrides border-t border-white/20 pt-16">
                    {registrationState?.isActivated ? (
                        <div id="success-block" className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white px-4 py-10 md:p-12 rounded-[2rem] shadow-2xl text-center flex-1 sm:flex-none flex flex-col justify-center w-full max-w-2xl mx-auto dark-theme-block-exception mb-20">
                            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                                <Check className="h-12 w-12 text-white stroke-[3]" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight mb-8">
                                Заявка успешно<br className="hidden sm:block" /> подтверждена!
                            </h1>
                            <div className="text-left mt-8 w-full max-w-md mx-auto sm:max-w-none">
                                <p className="text-xl text-[#334155] leading-relaxed mb-6">
                                    {(() => {
                                        const g = registrationState.gender || formData.gender;
                                        return g === 'Мужской' ? 'Уважаемый' : g === 'Женский' ? 'Уважаемая' : 'Уважаемый(ая)';
                                    })()}{' '}
                                    <span className="font-bold text-[#111827]">
                                        {`${registrationState.surname || formData.lastName} ${registrationState.name || formData.firstName}${((registrationState.patronymic || formData.patronymic) ? ' ' + (registrationState.patronymic || formData.patronymic) : '')}`}
                                    </span>, спасибо за участие!
                                </p>
                                <hr className="my-6 border-[#e5e7eb]" />
                                <div>
                                    <p className="text-sm text-[#64748b] mb-2 uppercase tracking-wider font-semibold">Ваша номинация</p>
                                    <p className="font-bold text-[#1d4ed8] text-xl">{registrationState.nomination || formData.nominationId}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Оставить заявку на участие</h2>
                            <p className="text-gray-200 text-lg md:text-xl font-medium mb-12">Время заполнения анкеты 10-15 минут. Желаем удачи! Вы все — большие молодцы. Нам есть чему у вас поучиться!</p>
                            
                            <form onSubmit={handleSubmit} className="space-y-12">
                        {/* Block 1: Основная информация */}
                        <div className="space-y-6">
                            <TextInput name="lastName" label="Фамилия" required value={formData.lastName} onChange={handleChange} onBlur={handleBlur} error={errors.lastName} format="capitalizeName" />
                            <TextInput name="firstName" label="Имя" required value={formData.firstName} onChange={handleChange} onBlur={handleBlur} error={errors.firstName} format="capitalizeName" />
                            <TextInput name="patronymic" label="Отчество" description="Если нет, то оставьте пустым" value={formData.patronymic} onChange={handleChange} onBlur={handleBlur} error={errors.patronymic} format="capitalizeName" />
                            
                            <RadioGroup name="gender" label="Пол" options={['Мужской', 'Женский']} required selected={formData.gender} onChange={handleChange} error={errors.gender} />
                            
                            <TextInput name="birthDate" label="Дата рождения" placeholder="Например: 15.05.1990" description="Введите вашу дату рождения в формате ДД.ММ.ГГГГ" required value={formData.birthDate} onChange={handleChange} onBlur={handleBlur} error={errors.birthDate} format="date" />
                            
                            <TextInput name="phone" type="tel" label="Телефон" placeholder="8 (999) 000-00-00" required value={formData.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} format="phone" />
                            <TextInput name="email" type="email" label="Email" placeholder="example@mail.ru" required value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} />
                            
                            <SearchableSelect name="region" label="Регион" options={REGIONS} required selected={formData.region} onChange={handleChange} onBlur={handleBlur} error={errors.region} />
                            <TextInput name="city" label="Город / Населённый пункт" description="Укажите ваш город или населённый пункт" required value={formData.city} onChange={handleChange} onBlur={handleBlur} error={errors.city} />

                            <BooleanToggle name="isMember" label="Вы являетесь членом ЛДПР?" required value={formData.isMember} onChange={handleChange} error={errors.isMember} />
                            
                            {formData.isMember === false && (
                                <BooleanToggle name="wishToJoin" label="Хотите ли Вы присоединиться к команде ЛДПР?" required value={formData.wishToJoin} onChange={handleChange} error={errors.wishToJoin} />
                            )}

                            {(formData.isMember === true || formData.wishToJoin === true) && (
                                <div className="duration-300">
                                    <TextInput name="homeAddress" label="Домашний адрес" description="Укажите свой домашний адрес" required value={formData.homeAddress} onChange={handleChange} onBlur={handleBlur} error={errors.homeAddress} />
                                </div>
                            )}

                            <BooleanToggle name="newsSubscription" label="Хотели бы вы получать информацию о инициативах и мероприятиях ЛДПР?" required value={formData.newsSubscription} onChange={handleChange} error={errors.newsSubscription} />

                            <TextInput name="organization" label="Организация и должность" required value={formData.organization} onChange={handleChange} onBlur={handleBlur} error={errors.organization} />
                            <TextInput name="industry" label="Сфера деятельности" required value={formData.industry} onChange={handleChange} onBlur={handleBlur} error={errors.industry} />
                            <NumberInput name="ogrn" label="ОГРН / ОГРНИП" required value={formData.ogrn} onChange={handleChange} onBlur={handleBlur} error={errors.ogrn} />
                            <TextInput name="website" type="url" label="Сайт" placeholder="https://example.com" required value={formData.website} onChange={handleChange} onBlur={handleBlur} error={errors.website} />
                        </div>

                        {/* Block 2: Выбор номинации */}
                        <div className="pt-8 border-t border-white/20">
                            <h2 className="text-2xl font-bold text-white mb-2">Выбор номинации <span className="text-red-500">*</span></h2>
                            <p className="text-base text-gray-300 mb-8">Принять участие можно только в одной номинации</p>
                            <NominationCards name="nominationId" options={NOMINATIONS_LIST} value={formData.nominationId} onChange={handleChange} error={errors.nominationId} />
                        </div>

                        {/* Block 3: Детали проекта (Динамический блок) */}
                        {formData.nominationId && (
                            <div className="pt-8 border-t border-white/20 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                <h2 className="text-2xl font-bold text-white mb-8">Детали проекта</h2>
                                
                                {formData.nominationId === 'velichie' ? (
                                    <div className="space-y-8">
                                        <RadioGroup
                                            name="velichieChoice"
                                            label="Выберите, пожалуйста, тематику предложения или проекта."
                                            options={VELICHIE_OPTIONS}
                                            selected={formData.velichieChoice || ''}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.velichieChoice && <p className="mt-1 text-sm text-red-600">{errors.velichieChoice}</p>}

                                        {formData.velichieChoice === VELICHIE_OPTIONS[1] && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                                <RadioGroup
                                                    name="velichieSphere"
                                                    label="Развития какой из перечисленных сфер касаются ваши предложения?"
                                                    options={VELICHIE_SPHERES}
                                                    selected={formData.velichieSphere || ''}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                {errors.velichieSphere && <p className="mt-1 text-sm text-red-600">{errors.velichieSphere}</p>}
                                            </div>
                                        )}

                                        {formData.velichieChoice && (
                                            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                                <TextInput
                                                    name="velichieProposal"
                                                    label="Пожалуйста, опишите своё предложение."
                                                    description={`При заполнении графы «${formData.velichieChoice}» просим вас избегать общих фраз. Ваше предложение должно быть реалистичным и направленным на решение конкретной проблемы. Рекомендуем сформулировать его как тезис: проблема — путь решения — ожидаемый результат.`}
                                                    multiline
                                                    required
                                                    value={formData.velichieProposal || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={errors.velichieProposal}
                                                />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {DYNAMIC_QUESTIONS[formData.nominationId]?.map((question, idx) => {
                                            const key = `dynamic${idx}` as keyof FormData;
                                            return (
                                                <TextInput
                                                    key={key}
                                                    name={key}
                                                    label={question}
                                                    multiline
                                                    required
                                                    value={formData[key] || ''}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={errors[key]}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Block 4: Подвал и отправка */}
                        <div className="space-y-6 pt-10 border-t border-white/20">
                            <div className="space-y-5">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="relative flex items-start pt-0.5">
                                        <input 
                                            type="checkbox" 
                                            name="agreement1" 
                                            checked={!!formData.agreement1}
                                            onChange={(e) => handleChange('agreement1', e.target.checked)}
                                            className="w-5 h-5 rounded border-white/40 text-white focus:ring-white transition-colors cursor-pointer" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base text-gray-200 leading-snug">
                                            Отправляя заявку на участие в премии, я выражаю готовность документально подтвердить предоставленную в форме заявки информацию. <span className="text-red-500">*</span>
                                        </span>
                                        {errors.agreement1 && <p className="mt-1 text-sm text-red-600">{errors.agreement1}</p>}
                                    </div>
                                </label>

                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <div className="relative flex items-start pt-0.5">
                                        <input 
                                            type="checkbox" 
                                            name="agreement2" 
                                            checked={!!formData.agreement2}
                                            onChange={(e) => handleChange('agreement2', e.target.checked)}
                                            className="w-5 h-5 rounded border-white/40 text-white focus:ring-white transition-colors cursor-pointer" 
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-base text-gray-200 leading-snug">
                                            Принимаю <a href="https://clck.ru/3S7mvx" target="_blank" rel="noopener noreferrer" className="text-white underline decoration-white/50 hover:decoration-white transition-colors">условия обработки персональных данных</a>. <span className="text-red-500">*</span>
                                        </span>
                                        {errors.agreement2 && <p className="mt-1 text-sm text-red-600">{errors.agreement2}</p>}
                                    </div>
                                </label>
                            </div>

                            <div className="pt-8 mb-10 flex flex-col md:flex-row items-center justify-center md:justify-start gap-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full md:w-auto min-w-[240px] px-8 py-4 bg-orange-500 text-white text-xl font-bold rounded-2xl shadow-lg hover:shadow-orange-500/50 hover:-translate-y-1 hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-300 cursor-pointer flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed pointer-events-none' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="animate-spin w-6 h-6" />
                                            <span>Отправка...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Участвую!</span>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                    </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
