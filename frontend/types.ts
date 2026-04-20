
export interface OtherLink {
    url: string;
}

export interface Education {
    level: string;
    organization: string;
    specialty?: string;
    hasPostgraduate: string; // 'Да' | 'Нет'
    postgraduateType?: string;
    postgraduateOrganization?: string;
    hasDegree: string; // 'Да' | 'Нет'
    degreeType?: string;
    hasTitle: string; // 'Да' | 'Нет'
    titleType?: string;
}

export interface WorkExperience {
    organization: string;
    position: string;
    startDate: string;
}

export interface SocialOrganization {
    name: string;
    position: string;
    years: string;
}

export interface Language {
    name: string;
    level: string;
}

export interface FormData {
    lastName: string;
    firstName: string;
    patronymic: string;
    gender: string;
    birthDate: string;
    phone: string;
    email: string;
    city: string;
    region: string;
    isMember: boolean | null;
    wishToJoin: boolean | null;
    homeAddress: string;
    newsSubscription: boolean | null;
    organization: string;
    industry: string;
    ogrn: string;
    website: string;
    nominationId: string;
    agreement1: boolean;
    agreement2: boolean;
    [key: string]: any; // Allow dynamic fields
}
