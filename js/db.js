// ==================================================================
// DATABASE SERVICE (LOCALSTORAGE)
// ==================================================================
// This file uses localStorage to simulate a database in the browser.
// All backend API calls have been removed.
// ==================================================================

const USERS_KEY = 'healthub_users';
const ADMIN_EMAIL = 'krishna@gmail.com';

// --- Helper Functions ---
function getUsers() {
    try {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    } catch (e) {
        console.error("Error parsing users from localStorage", e);
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Seed the database with a permanent admin if it doesn't exist
function seedDatabase() {
    const users = getUsers();
    const adminExists = users.some(u => u.email === ADMIN_EMAIL);
    if (!adminExists) {
        console.log('Permanent admin not found. Creating one...');
        users.push({
            healthId: 'ADMIN_PERM_001',
            name: 'Krishna (Permanent Admin)',
            email: ADMIN_EMAIL,
            password: 'manu098', // Storing plaintext for simplicity as there is no backend.
            role: 'Admin',
        });
        saveUsers(users);
        console.log('Permanent admin created.');
    }
}

// --- API-like Functions ---

export const registerUser = (user) => {
    return new Promise((resolve, reject) => {
        const users = getUsers();
        const existingUser = users.find(u => u.email === user.email || u.healthId === user.healthId);
        if (existingUser) {
            return reject(new Error('User with this email or Health ID already exists.'));
        }
        users.push(user);
        saveUsers(users);
        resolve(user);
    });
};

export const authenticateUser = (identifier, password) => {
    return new Promise((resolve, reject) => {
        const users = getUsers();
        const user = users.find(u => (u.healthId === identifier || u.email === identifier));
        if (user && user.password === password) {
            resolve(user);
        } else {
            reject(new Error('Invalid credentials.'));
        }
    });
};

export const authenticateAdmin = (email, password) => {
    return new Promise((resolve, reject) => {
        const users = getUsers();
        const admin = users.find(u => u.email === email && u.role === 'Admin');
        if (admin && admin.password === password) {
            resolve(admin);
        } else {
            reject(new Error('Invalid admin credentials.'));
        }
    });
};

export const getUserById = (healthId) => {
    return new Promise((resolve) => {
        const users = getUsers();
        const user = users.find(u => u.healthId === healthId);
        resolve(user || null);
    });
};

export const updateUser = (healthId, updatedUserData) => {
    return new Promise((resolve, reject) => {
        let users = getUsers();
        const userIndex = users.findIndex(u => u.healthId === healthId);
        if (userIndex === -1) {
            return reject(new Error('User not found.'));
        }
        // In a real scenario, you'd handle password hashing if updatedUserData.password exists
        users[userIndex] = { ...users[userIndex], ...updatedUserData };
        saveUsers(users);
        resolve(users[userIndex]);
    });
};

export const getMedicalRecords = (healthId) => {
    return getUserById(healthId).then(user => user?.medicalRecords || []);
};

export const addMedicalRecord = (healthId, recordData) => {
    return getUserById(healthId).then(user => {
        if (!user) throw new Error("User not found");
        if (!user.medicalRecords) user.medicalRecords = [];
        const newRecord = { ...recordData, id: `REC_${Date.now()}` };
        user.medicalRecords.push(newRecord);
        return updateUser(healthId, { medicalRecords: user.medicalRecords }).then(() => newRecord);
    });
};

export const getAllUsers = () => {
    return new Promise((resolve) => {
        resolve(getUsers());
    });
};

export const deleteUser = (healthId) => {
    return new Promise((resolve) => {
        let users = getUsers();
        users = users.filter(u => u.healthId !== healthId);
        saveUsers(users);
        resolve();
    });
};

export const adminAddUser = (user) => {
    return registerUser(user);
};

export const getDoctorPatients = (doctorId) => {
    return getUserById(doctorId).then(doctor => {
        if (!doctor || !doctor.patients) return [];
        const allUsers = getUsers();
        return allUsers.filter(u => doctor.patients.includes(u.healthId));
    });
};

export const linkPatientToDoctor = (doctorId, patientHealthId) => {
    return getUserById(doctorId).then(doctor => {
        if (!doctor) throw new Error("Doctor not found");
        return getUserById(patientHealthId).then(patient => {
            if (!patient) throw new Error("Patient not found");
            if (!doctor.patients) doctor.patients = [];
            if (!doctor.patients.includes(patientHealthId)) {
                doctor.patients.push(patientHealthId);
            }
            return updateUser(doctorId, { patients: doctor.patients });
        });
    });
};

export const unlinkPatientFromDoctor = (doctorId, patientHealthId) => {
     return getUserById(doctorId).then(doctor => {
        if (!doctor || !doctor.patients) return;
        const updatedPatients = doctor.patients.filter(id => id !== patientHealthId);
        return updateUser(doctorId, { patients: updatedPatients });
    });
};

export const getPatientDoctors = (patientId) => {
    return getUserById(patientId).then(patient => {
        if (!patient || !patient.doctors) return [];
        const allUsers = getUsers();
        return allUsers.filter(u => patient.doctors.includes(u.healthId));
    });
};

export const linkDoctorToPatient = (patientId, doctorIdentifier) => {
     const users = getUsers();
     const doctor = users.find(u => u.role === 'Doctor' && (u.healthId === doctorIdentifier || u.email === doctorIdentifier));
     if (!doctor) return Promise.reject(new Error("Doctor with that ID or email not found."));
     
     return getUserById(patientId).then(patient => {
        if (!patient) throw new Error("Patient not found");
        if (!patient.doctors) patient.doctors = [];
        if (!patient.doctors.includes(doctor.healthId)) {
            patient.doctors.push(doctor.healthId);
        }
        return updateUser(patientId, { doctors: patient.doctors });
     });
};

export const unlinkDoctorFromPatient = (patientId, doctorId) => {
    return getUserById(patientId).then(patient => {
        if (!patient || !patient.doctors) return;
        const updatedDoctors = patient.doctors.filter(id => id !== doctorId);
        return updateUser(patientId, { doctors: updatedDoctors });
    });
};

export const sendCommunicationToPatient = async (patientId, fromDoctor, communicationData) => {
    const patient = await getUserById(patientId);
    if (!patient) throw new Error("Patient not found");
    
    const newComm = {
        id: `COMM_${Date.now()}`,
        from: { id: fromDoctor.healthId, name: fromDoctor.name },
        toId: patientId,
        timestamp: new Date().toISOString(),
        ...communicationData
    };
    
    if (!patient.communications) patient.communications = [];
    patient.communications.unshift(newComm);
    await updateUser(patientId, { communications: patient.communications });
    return newComm;
};

export const sendCommunicationFromPatient = async (doctorId, fromPatient, communicationData) => {
    const doctor = await getUserById(doctorId);
    if (!doctor) throw new Error("Doctor not found");
    
    const newComm = {
        id: `COMM_${Date.now()}`,
        from: { id: fromPatient.healthId, name: fromPatient.name },
        toId: doctorId,
        timestamp: new Date().toISOString(),
        ...communicationData
    };

    if (!doctor.communications) doctor.communications = [];
    doctor.communications.unshift(newComm);
    await updateUser(doctorId, { communications: doctor.communications });
    return newComm;
};

// Seed the database on load
seedDatabase();