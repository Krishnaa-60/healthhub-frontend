export enum UserRole {
  PATIENT = 'Patient',
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
}

export enum AuthMode {
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgotPassword',
}

export type AppView = 'auth' | 'contact' | 'about' | 'admin-portal';

export interface MedicalRecordFile {
  name: string;
  content: string; // base64 on upload, URL when fetched from DB
}

export interface MedicalRecord {
  recordId: string;
  name: string;
  category: string;
  disease: string;
  files: MedicalRecordFile[];
  isLocked: boolean;
  phoneForOTP?: string;
  dateAdded: string; // YYYY-MM-DD
}

export interface Address {
  address1: string;
  address2: string;
  landmark?: string;
  district: string;
  pincode?: string;
  state: string;
}

export interface EmergencyContact {
    name: string;
    mobile: string;
    email?: string;
    relation: string;
    address: Address;
}

export interface PermanentDisease {
    name: string;
    years: string;
}

export interface Appointment {
    id: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    
    // Patient-centric fields
    hospitalName?: string;
    doctorName?: string;
    
    // Doctor-centric fields
    patientName?: string;
    patientMobile?: string;
    patientEmail?: string;
    
    reminderSet?: boolean;
}

export interface MedicationTime {
  id: string;
  time: string; // HH:MM
  reminderEnabled: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  times: MedicationTime[];
  courseDurationDays?: number;
}

export interface Prescription {
  id: string;
  name: string;
  doctorName?: string;
  dateAdded: string; // YYYY-MM-DD
  medications: Medication[];
}

export interface Communication {
  id: string;
  from: {
    id: string;
    name: string;
  };
  toId: string; // recipient's Health ID
  timestamp: string; // ISO string
  message?: string;
  imageUrl?: string; // base64 on send, URL when fetched
  read?: boolean; // whether the recipient has read the message
  replyTo?: {
    id: string;
    message?: string;
    imageUrl?: string;
    from?: { id: string; name: string };
    timestamp?: string;
  };
  recordShare?: {
    recordId: string;
    name: string;
    category?: string;
    disease?: string;
    files?: { name: string; content: string }[];
    dateAdded?: string;
  };
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string; // ISO date string
}


export interface User {
  healthId: string;
  name: string;
  avatar?: string; // base64 on upload, URL when fetched
  password?: string;
  birthdate?: string;
  mobileNo?: string;
  aadharNo?: string;
  email?: string;
  bloodGroup?: string;
  address?: Address;
  securityQuestion?: string;
  securityAnswer?: string;
  medicalRecords?: MedicalRecord[];
  permanentDiseases?: PermanentDisease[];
  emergencyContact?: EmergencyContact;
  appointments?: Appointment[];
  prescriptions?: Prescription[];
  role?: UserRole;
  // Doctor-specific fields
  specialization?: string;
  education?: string;
  experience?: string;
  currentHospital?: string;
  patients?: string[]; // Array of patient Health IDs
  // Patient-specific fields
  doctors?: string[]; // Array of doctor Health IDs
  communications?: Communication[];
}

export type DashboardView = 'home' | 'profile' | 'appointments' | 'records' | 'prescriptions' | 'diet' | 'doctors' | 'search';