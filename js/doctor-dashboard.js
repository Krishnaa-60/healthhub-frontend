import { checkSession, handleLogout, createToast } from './common.js';
import { getDoctorPatients, unlinkPatientFromDoctor, linkPatientToDoctor, sendCommunicationToPatient } from './db.js';

const UserRole = { DOCTOR: 'Doctor' };

const state = {
    doctor: null,
    activeView: 'dashboard', // 'dashboard', 'patients', 'communications'
    patients: [],
    isLoading: true,
    error: '',
    searchQuery: '',
    viewingPatient: null,
    isAddModalOpen: false,
    isMessageModalOpen: false,
    messagingPatient: null,
    communications: [],
};

// --- RENDER FUNCTIONS ---

function render() {
    if (!state.doctor) return;
    const container = document.getElementById('doctor-dashboard-container');
    if (!container) return;

    container.innerHTML = `
        ${renderHeader()}
        <div class="flex flex-grow overflow-hidden">
            ${renderSidebar()}
            <main class="flex-grow p-6 md:p-8 overflow-y-auto">
                ${renderMainContent()}
            </main>
        </div>
    `;

    renderModals();
    addEventListeners();
}

function renderHeader() {
    return `
    <header class="bg-dark-card/80 backdrop-blur-sm shadow-lg p-3 flex justify-between items-center flex-shrink-0 z-20 border-b border-dark-subtext/20">
      <div class="flex items-center space-x-2">
        <svg class="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 0L95.1 19.5V56.2C95.1 82 75.8 100 50 100C24.2 100 4.9 82 4.9 56.2V19.5L50 0Z" fill="#27C690"></path><path d="M50 83.3C50 83.3 68.8 70.8 68.8 56.2V33.2L50 25L31.2 33.2V56.2C31.2 70.8 50 83.3 50 83.3Z" fill="white"></path><path d="M55.2 46.9H51V42.7C51 42.1 50.5 41.7 50 41.7C49.5 41.7 49 42.1 49 42.7V46.9H44.8C44.3 46.9 43.8 47.3 43.8 47.9C43.8 48.5 44.3 48.9 44.8 48.9H49V53.1C49 53.7 49.5 54.1 50 54.1C50.5 54.1 51 53.7 51 53.1V48.9H55.2C55.7 48.9 56.2 48.5 56.2 47.9C56.2 47.3 55.7 46.9 55.2 46.9Z" fill="#27C690"></path></svg>
        <span class="text-xl font-bold tracking-wider">Healthub Doctor</span>
      </div>
      <div class="flex items-center space-x-4">
        <div class="text-right">
          <div class="font-semibold text-sm">${state.doctor.name}</div>
          <div class="text-xs text-dark-subtext">${state.doctor.specialization || 'Doctor'}</div>
        </div>
        <button id="logout-btn" class="text-sm text-red-400 hover:bg-red-500/10 font-semibold py-2 px-3 rounded-md transition-colors" aria-label="Logout">Logout</button>
      </div>
    </header>`;
}

function renderSidebar() {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>` },
        { id: 'patients', label: 'My Patients', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>` },
        { id: 'communications', label: 'Inbox', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>` },
    ];
    return `
    <aside class="w-64 bg-dark-card/90 backdrop-blur-sm p-4 border-r border-dark-subtext/20 flex flex-col flex-shrink-0">
      <div class="text-dark-subtext text-xs font-semibold uppercase tracking-wider mb-3 px-2">Menu</div>
      <nav class="flex flex-col space-y-2">
        ${navItems.map(item => `
          <button data-viewid="${item.id}" class="nav-btn flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:translate-x-1 ${
              state.activeView === item.id ? 'bg-brand-blue text-white shadow-lg' : 'text-dark-subtext hover:bg-dark-bg'
          }" aria-current="${state.activeView === item.id}">
            ${item.icon}
            <span>${item.label}</span>
          </button>
        `).join('')}
      </nav>
    </aside>`;
}

function renderMainContent() {
    if (state.isLoading) {
        return `<div class="flex items-center justify-center h-full">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-accent"></div>
                </div>`;
    }
    if (state.error) {
        return `<p class="text-red-400">${state.error}</p>`;
    }
    switch (state.activeView) {
        case 'patients': return renderPatientManagementView();
        case 'communications': return renderCommunicationsView();
        case 'dashboard':
        default: return renderDashboardHome();
    }
}

function renderDashboardHome() {
    return `
    <div class="space-y-8">
        <div>
            <h1 class="text-3xl font-bold">Welcome, ${state.doctor.name}</h1>
            <p class="text-md text-dark-subtext mt-1">Here is a summary of your activity.</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-dark-card p-5 rounded-lg shadow-lg flex items-center space-x-4 border border-dark-subtext/10">
                <div class="p-3 rounded-lg bg-dark-accent/10"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
                <div><div class="text-2xl font-bold text-dark-text">${state.patients.length}</div><div class="text-sm text-dark-subtext">Total Patients</div></div>
            </div>
        </div>
    </div>`;
}

function renderPatientManagementView() {
    const filteredPatients = state.patients.filter(p =>
        p.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        p.healthId.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        (p.email && p.email.toLowerCase().includes(state.searchQuery.toLowerCase()))
    );

    return `
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold">My Patients</h1>
                <p class="text-md text-dark-subtext mt-1">Manage patients linked to your account.</p>
            </div>
            <button id="add-patient-btn" class="flex items-center gap-2 px-4 py-2 bg-dark-accent text-dark-bg font-semibold rounded-lg shadow-sm hover:bg-opacity-80 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                Add Patient
            </button>
        </div>
        <div class="bg-dark-card p-4 rounded-lg shadow-lg">
             <div class="relative mb-4">
                <input id="search-input" type="search" placeholder="Search by name, Health ID..." value="${state.searchQuery}" class="w-full pl-4 pr-4 py-2.5 bg-dark-bg border border-dark-subtext/20 rounded-lg focus:ring-2 focus:ring-dark-accent focus:outline-none transition-all">
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left table-auto">
                    <thead>
                        <tr class="border-b border-dark-subtext/20 text-xs text-dark-subtext uppercase">
                            <th class="p-3">Name</th><th class="p-3">Health ID / Email</th><th class="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredPatients.map(p => `
                            <tr data-patientid="${p.healthId}" class="patient-row border-b border-dark-subtext/10 text-sm hover:bg-dark-bg cursor-pointer">
                                <td class="p-3 font-medium">${p.name}</td>
                                <td class="p-3 text-dark-subtext"><div>${p.healthId}</div><div class="text-xs">${p.email || ''}</div></td>
                                <td class="p-3 text-right">
                                    <button data-patientid="${p.healthId}" class="remove-patient-btn p-2 rounded-full hover:bg-red-500/10 text-dark-subtext hover:text-red-400">&times;</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
}

function renderCommunicationsView() {
    return `<div>Communications View - Coming Soon</div>`;
}

function renderModals() {
    document.querySelectorAll('.modal-container').forEach(el => el.remove());
    if (state.isAddModalOpen) {
        const modal = document.createElement('div');
        modal.id = 'add-patient-modal';
        modal.className = 'modal-container fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
        <div class="bg-dark-card rounded-lg shadow-xl w-full max-w-md">
            <div class="flex justify-between items-center p-4 border-b border-dark-subtext/20">
                <h2 class="text-xl font-bold">Add Patient to Your List</h2>
                <button type="button" class="close-modal-btn p-2 rounded-full hover:bg-dark-bg">&times;</button>
            </div>
            <form id="add-patient-form">
                <div class="p-6 space-y-4">
                    <p class="text-sm text-dark-subtext">Enter the Health ID of an existing patient to link them.</p>
                    <div>
                        <label for="patientHealthId" class="block text-sm font-bold text-dark-subtext mb-1">Patient's Health ID</label>
                        <input type="text" name="patientHealthId" required class="block w-full px-3 py-2 bg-dark-bg border border-dark-subtext/20 rounded-md">
                    </div>
                    <div id="add-patient-error" class="text-red-400 text-sm hidden"></div>
                </div>
                <div class="px-6 py-4 bg-dark-bg/50 rounded-b-lg flex justify-end">
                    <button type="submit" class="px-4 py-2 text-sm font-medium text-dark-bg bg-dark-accent rounded-md">Link Patient</button>
                </div>
            </form>
        </div>
        `;
        document.body.appendChild(modal);
    }
}

// --- EVENT LISTENERS & LOGIC ---

function addEventListeners() {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.activeView = btn.dataset.viewid;
            render();
        });
    });

    document.getElementById('add-patient-btn')?.addEventListener('click', () => {
        state.isAddModalOpen = true;
        render();
    });

    const addPatientModal = document.getElementById('add-patient-modal');
    if (addPatientModal) {
        addPatientModal.addEventListener('click', e => {
            if (e.target.id === 'add-patient-modal' || e.target.closest('.close-modal-btn')) {
                state.isAddModalOpen = false;
                render();
            }
        });
        document.getElementById('add-patient-form').addEventListener('submit', handleAddPatientSubmit);
    }
}

async function handleAddPatientSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const healthId = form.patientHealthId.value;
    const errorEl = document.getElementById('add-patient-error');
    errorEl.classList.add('hidden');
    
    try {
        await linkPatientToDoctor(state.doctor.healthId, healthId);
        createToast('Patient linked successfully!');
        state.isAddModalOpen = false;
        await fetchPatients(); // Re-fetches and re-renders
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    }
}

async function fetchPatients() {
    state.isLoading = true;
    render();
    try {
        const patients = await getDoctorPatients(state.doctor.healthId);
        state.patients = patients;
        state.communications = state.doctor.communications || [];
        state.error = '';
    } catch (err) {
        state.error = err.message;
    } finally {
        state.isLoading = false;
        render();
    }
}

// --- INITIALIZATION ---

async function init() {
    const doctor = await checkSession([UserRole.DOCTOR]);
    if (doctor) {
        state.doctor = doctor;
        await fetchPatients();
    }
}

document.addEventListener('DOMContentLoaded', init);