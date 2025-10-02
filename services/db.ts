import { User, UserRole, MedicalRecord, Communication, ContactMessage } from '../types';

// Determine API URL based on environment
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://healthhub-backend1.onrender.com/api';

// Helper function for API requests
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            const errorText = await response.text();
            try {
                // Try parsing as JSON for structured error messages
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            } catch (e) {
                // If not JSON, throw the raw text
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }
        }
        
        // Handle 204 No Content or other responses with no body
        if (response.status === 204) {
            return null as T;
        }

        const responseText = await response.text();
        return responseText ? (JSON.parse(responseText) as T) : (null as T);

    } catch (error) {
        console.error('API Request Error:', error);
        if (error instanceof TypeError) {
            throw new Error('Cannot connect to the server. Please check your connection.');
        }
        throw error;
    }
}


export const registerUser = (user: User): Promise<User> => {
    return apiRequest<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(user),
    });
};

export const authenticateUser = (identifier: string, password: string): Promise<User> => {
    return apiRequest<User>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
    });
};

export const authenticateAdmin = (email: string, password: string): Promise<User> => {
    return apiRequest<User>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
};

export const requestPasswordResetOtp = (email: string, role: UserRole): Promise<{ message: string }> => {
    return apiRequest('/auth/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
    });
};

export const resetPasswordWithOtp = (email: string, otp: string, newPassword: string): Promise<{ message: string }> => {
    return apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
    });
};

export const getUserById = (healthId: string): Promise<User | null> => {
    return apiRequest<User | null>(`/users/${healthId}`);
};

export const updateUser = (healthId: string, updatedUserData: Partial<User>): Promise<User> => {
    return apiRequest<User>(`/users/${healthId}`, {
        method: 'PATCH',
        body: JSON.stringify(updatedUserData),
    });
};

export const getMedicalRecords = (healthId: string): Promise<MedicalRecord[]> => {
    return apiRequest<MedicalRecord[]>(`/users/${healthId}/medical-records`);
};

export const addMedicalRecord = (healthId: string, recordData: Omit<MedicalRecord, 'recordId'>): Promise<MedicalRecord> => {
    return apiRequest<MedicalRecord>(`/users/${healthId}/medical-records`, {
        method: 'POST',
        body: JSON.stringify(recordData),
    });
};

export const deleteMedicalRecord = (healthId: string, recordId: string): Promise<void> => {
    return apiRequest<void>(`/users/${healthId}/medical-records/${recordId}`, {
        method: 'DELETE',
    });
};

export const requestOtpForRecord = (healthId: string): Promise<{ message: string }> => {
    return apiRequest('/records/request-otp', {
        method: 'POST',
        body: JSON.stringify({ healthId }),
    });
};

export const verifyOtpForRecord = (healthId: string, otp: string): Promise<{ message: string }> => {
    return apiRequest('/records/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ healthId, otp }),
    });
};

export const getAllUsers = (): Promise<User[]> => {
    return apiRequest<User[]>('/admin/users');
};

export const deleteUser = (healthId: string): Promise<void> => {
    return apiRequest<void>(`/admin/users/${healthId}`, { method: 'DELETE' });
};

export const adminAddUser = (user: User): Promise<User> => {
    return apiRequest<User>('/admin/users', {
        method: 'POST',
        body: JSON.stringify(user),
    });
};

export const getDoctorPatients = (doctorId: string): Promise<User[]> => {
    return apiRequest<User[]>(`/doctors/${doctorId}/patients`);
};

export const linkPatientToDoctor = (doctorId: string, patientHealthId: string): Promise<void> => {
    return apiRequest<void>(`/doctors/${doctorId}/patients`, {
        method: 'POST',
        body: JSON.stringify({ patientHealthId }),
    });
};

export const unlinkPatientFromDoctor = (doctorId: string, patientHealthId: string): Promise<void> => {
    return apiRequest<void>(`/doctors/${doctorId}/patients/${patientHealthId}`, { method: 'DELETE' });
};

export const getPatientDoctors = (patientId: string): Promise<User[]> => {
    return apiRequest<User[]>(`/patients/${patientId}/doctors`);
};

export const linkDoctorToPatient = (patientId: string, doctorIdentifier: string): Promise<void> => {
    return apiRequest<void>(`/patients/${patientId}/doctors`, {
        method: 'POST',
        body: JSON.stringify({ doctorIdentifier }),
    });
};

export const unlinkDoctorFromPatient = (patientId: string, doctorId: string): Promise<void> => {
    return apiRequest<void>(`/patients/${patientId}/doctors/${doctorId}`, { method: 'DELETE' });
};

export const sendCommunicationToPatient = async (patientId: string, fromDoctor: User, communicationData: { message?: string; imageUrl?: string }): Promise<void> => {
    return apiRequest<void>('/communications/to-patient', {
        method: 'POST',
        body: JSON.stringify({
            patientId,
            fromDoctor: { id: fromDoctor.healthId, name: fromDoctor.name },
            ...communicationData
        })
    });
};

export const sendCommunicationFromPatient = async (doctorId: string, fromPatient: User, communicationData: { message: string }): Promise<void> => {
     return apiRequest<void>('/communications/from-patient', {
        method: 'POST',
        body: JSON.stringify({
            doctorId,
            fromPatient: { id: fromPatient.healthId, name: fromPatient.name },
            ...communicationData,
        })
    });
};


export const generateDietPlan = (healthCondition: string): Promise<any> => {
  return apiRequest('/ai/generate-diet-plan', {
    method: 'POST',
    body: JSON.stringify({ healthCondition }),
  });
};

export const generateHealthTip = async (): Promise<{ tip: string }> => {
  return apiRequest('/ai/generate-health-tip', { method: 'GET' });
};

export const sendContactMessage = (formData: { name: string, email: string, message: string }): Promise<{ message: string }> => {
    return apiRequest('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
    });
};

export const getContactMessages = (): Promise<ContactMessage[]> => {
    return apiRequest('/admin/messages');
};

export const deleteContactMessage = (messageId: string): Promise<void> => {
    return apiRequest(`/admin/messages/${messageId}`, {
        method: 'DELETE',
    });
};