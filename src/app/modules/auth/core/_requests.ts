import axios from "axios";
import {AuthModel, UserModel} from "./_models";

const API_URL = process.env.REACT_APP_API_URL;

// Authentication header helper
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    };
};

// AUTHENTICATION
export const GET_USER_BY_ACCESSTOKEN_URL = `${API_URL}/verify_token`;
export const LOGIN_URL = `${API_URL}/user/login`;
export const REGISTER_URL = `${API_URL}/user/create`;
export const REQUEST_PASSWORD_URL = `${API_URL}/user/forgot_password`;

export function login(username: string, password: string, selectedLang: string) {
    return axios.post(LOGIN_URL, {username, password, selectedLang});
}

export function register(
    email: string, name: string, surname: string, phone: string, birthdate: string, gender: string, bloodType: string,
    nationalID: string | null, passportNumber: string | null, consentApproval: boolean, schoolID: number,
    roleID: number, subRoleID: number | null, language: string
) {
    return axios.post(REGISTER_URL, {
        email, name, surname, phone, birthdate, gender, bloodType, nationalID, passportNumber,
        consentApproval, schoolID, roleID, subRoleID, language
    });
}

export function requestPassword(email: string) {
    return axios.post(REQUEST_PASSWORD_URL, {email});
}

export function getUserByToken(token: string) {
    return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {token}, getAuthHeaders());
}


// COUNTRY & CITY
export const GET_COUNTRIES_URL = `${API_URL}/countries`;
export const GET_CITIES_BY_COUNTRY_URL = `${API_URL}/cities`;

export function fetchCountries() {
    return axios.get(GET_COUNTRIES_URL, getAuthHeaders());
}

export function fetchCitiesByCountry(countryID: number) {
    return axios.get(`${GET_CITIES_BY_COUNTRY_URL}?countryID=${countryID}`, getAuthHeaders());
}

export function addCountry(countryName: string, countryName_fr: string) {
    return axios.post(GET_COUNTRIES_URL, {countryName, countryName_fr}, getAuthHeaders());
}

export function updateCountry(id: number, countryName: string, countryName_fr: string) {
    return axios.put(GET_COUNTRIES_URL, {id, countryName, countryName_fr}, getAuthHeaders());
}

export function deleteCountry(id: number) {
    return axios.delete(GET_COUNTRIES_URL, {data: {id}, ...getAuthHeaders()});
}

export function addCity(cityName: string, countryID: number) {
    return axios.post(GET_CITIES_BY_COUNTRY_URL, {cityName, countryID}, getAuthHeaders());
}

export function updateCity(id: number, cityName: string) {
    return axios.put(GET_CITIES_BY_COUNTRY_URL, {id, cityName}, getAuthHeaders());
}

export function deleteCity(id: number) {
    return axios.delete(GET_CITIES_BY_COUNTRY_URL, {data: {id}, ...getAuthHeaders()});
}

export function confirmDeleteCountry(id: number) {
    return axios.post(`${GET_COUNTRIES_URL}/confirm-delete`, {id}, getAuthHeaders());
}


// SCHOOL
export const GET_SCHOOLS_URL = `${API_URL}/schools`;
export const ADD_SCHOOL_URL = `${API_URL}/schools`;
export const UPDATE_SCHOOL_URL = (id: number) => `${API_URL}/schools/${id}`;
export const DELETE_SCHOOL_URL = (id: number) => `${API_URL}/schools/${id}`;

export function fetchSchools() {
    try {
        return axios.get(GET_SCHOOLS_URL);
    } catch (error) {
        console.error('Error fetching schools:', error);
        throw error;
    }
}

export const fetchRoles = async () => {
    try {
        const response = await axios.get(`${API_URL}/roles`, getAuthHeaders());
        return response;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

export function addSchool(schoolName: string, countryID?: number | null) {
    const data: any = {schoolName};
    if (countryID) {
        data.countryID = countryID;
    }
    return axios.post(ADD_SCHOOL_URL, data, getAuthHeaders());
}

export function updateSchool(schoolID: number, schoolName: string, countryID?: number | null) {
    const data: any = {schoolName};
    if (countryID) {
        data.countryID = countryID;
    }
    return axios.put(UPDATE_SCHOOL_URL(schoolID), data, getAuthHeaders());
}

export function deleteSchool(schoolID: number) {
    return axios.delete(DELETE_SCHOOL_URL(schoolID), getAuthHeaders());
}


// COMMISSION
export const GET_COMMISSIONS_URL = `${API_URL}/commissions`;
export const ADD_COMMISSION_URL = `${API_URL}/commissions`;
export const UPDATE_COMMISSION_URL = `${API_URL}/commissions`;
export const DELETE_COMMISSION_URL = `${API_URL}/commissions`;

export function fetchCommissions() {
    return axios.get(GET_COMMISSIONS_URL, getAuthHeaders());
}

export function addCommission(commissionName: string, commissionName_fr: string) {
    return axios.post(ADD_COMMISSION_URL, {commissionName, commissionName_fr}, getAuthHeaders());
}

export function updateCommission(id: number, commissionName: string, commissionName_fr: string) {
    return axios.put(UPDATE_COMMISSION_URL, {id, commissionName, commissionName_fr}, getAuthHeaders());
}

export function deleteCommission(id: number) {
    return axios.delete(DELETE_COMMISSION_URL, {data: {id}, ...getAuthHeaders()});
}


// USER MANAGEMENT
export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/user/fetch`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const updateUserStatus = async (userId: number, isActive: boolean) => {
    try {
        const response = await axios.put(`${API_URL}/user/update-status`, {userId, isActive}, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

export const resetUserPassword = async (userId: number) => {
    try {
        const response = await axios.put(`${API_URL}/user/reset-password-for-admin`, {userId}, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error resetting password:', error);
        throw error;
    }
};

export const approvePayment = async (userId: number, newStatus: boolean) => {
    try {
        const response = await axios.put(`${API_URL}/user/approve-payment`, {userId, newStatus}, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error approving payment:', error);
        throw error;
    }
};


export const sendPaymentConfirmationEmail = async (userId: number) => {
    try {
        const response = await axios.post(`${API_URL}/user/send-confirmation-email`, {userId}, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const updateUser = async (userId: number, userData: any) => {
    try {
        const response = await axios.put(`${API_URL}/user/update/${userId}`, userData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (userId: number) => {
    try {
        const response = await axios.delete(`${API_URL}/user/${userId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

export async function saveFormData(formData: any) {
    try {
        const response = await axios.post(`${API_URL}/saved-form-data`, formData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Form verileri kaydedilirken hata oluştu:", error);
        throw error;
    }
}

export async function getFormDataByUserId(userId: number) {
    try {
        const response = await axios.get(`${API_URL}/saved-form-data/user/${userId}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error(`User ID ${userId} için form verileri alınırken hata oluştu:`, error);
        throw error;
    }
}

export async function getAllFormData() {
    try {
        const response = await axios.get(`${API_URL}/saved-form-data`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Tüm form verileri getirilirken hata oluştu:", error);
        throw error;
    }
}

export async function deleteFormData(id: number, currentUser: number) {
    try {
        const response = await axios.delete(`${API_URL}/saved-form-data/${id}/${currentUser}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Kayıt silinirken hata oluştu:", error);
        throw error;
    }
}
export async function updateFormData(
    id: number,
    data: { commissionID: number | undefined; language: string | undefined; countryID: number | undefined }
) {
    const API_URL = process.env.REACT_APP_API_URL;
    const UPDATE_FORM_DATA_URL = `${API_URL}/saved-form-data/${id}`;

    try {
        const response = await axios.put(UPDATE_FORM_DATA_URL, data, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error('Error updating form data:', error);
        throw error;
    }
}

export async function setLanguageForDatabase(lang: string, userId: number) {
    try {
        let sendData = {selectedLang: lang, id: userId};
        let result = await axios.post(`${API_URL}/update-language`, sendData, getAuthHeaders());
        return result.data;
    } catch (error) {
        console.error('Dil güncelleme hatası:', error);
    }
}


export async function uploadPayment(file: File, userId: number) {
    const API_URL = process.env.REACT_APP_API_URL;
    const UPLOAD_PAYMENT_URL = `${API_URL}/api/upload-payment`;

    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('file', file);


    try {
        const response = await axios.post(UPLOAD_PAYMENT_URL, formData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading payment:', error);
        throw error;
    }
}

export async function uploadPaymentForAdmins(file: File, userId: number) {
    const API_URL = process.env.REACT_APP_API_URL;
    const UPLOAD_PAYMENT_URL = `${API_URL}/api/uploads-payments-for-admins`;

    const formData = new FormData();
    formData.append('userId', userId.toString());
    formData.append('file', file);


    try {
        const response = await axios.post(UPLOAD_PAYMENT_URL, formData);
        return response.data;
    } catch (error) {
        console.error('Error uploading payment:', error);
        throw error;
    }
}

export async function deletePayment(userId: number) {
    const API_URL = process.env.REACT_APP_API_URL;
    const DELETE_PAYMENT_URL = `${API_URL}/api/delete-payment`;

    try {
        const response = await axios.delete(DELETE_PAYMENT_URL, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            },
            data: {
                userId: userId,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }
}









