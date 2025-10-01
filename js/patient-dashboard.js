import { checkSession, handleLogout, createToast } from './common.js';
import { getMedicalRecords, updateUser, addMedicalRecord, getPatientDoctors, linkDoctorToPatient, unlinkDoctorFromPatient, sendCommunicationFromPatient } from './db.js';
import { GoogleGenAI, Type } from "@google/genai";

const UserRole = { PATIENT: 'Patient' };
const MEDICAL_RECORD_CATEGORIES = ['Lab Report', 'Imaging', 'Prescription', 'Doctor Note', 'Vitals', 'Surgical Report', 'Other'];

const state = {
    user: null,
    activeView: 'home', // 'home', 'profile', etc.
    showFullDashboard: false,
    medicalRecords: [],
    isLoadingRecords: false,
    recordsError: '',
    showUploadModal: false,
    previewingRecord: null,
    verifyingRecord: null,
    searchQuery: '',
    appointments: [],
    isAppointmentModalOpen: false,
    editingAppointment: null,
    prescriptions: [],
    isPrescriptionModalOpen: false,
    editingPrescription: null,
    isMedicationModalOpen: false,
    editingMedicationInfo: { prescriptionId: '', medication: null },
    doctors: [],
    communications: [],
    isDoctorMessageModalOpen: false,
    messagingDoctor: null,
};

// --- RENDER FUNCTIONS ---

function render() {
    if (!state.user) return;
    const container = document.getElementById('dashboard-container');
    if (!container) return;

    let contentHtml = renderHeader();
    contentHtml += `<div id="dashboard-content" class="flex-grow flex overflow-hidden">`;

    if (state.showFullDashboard) {
        contentHtml += renderSidebar();
        contentHtml += `<main class="flex-grow p-6 md:p-8 overflow-y-auto relative">
                            <div class="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
                                <div class="absolute top-0 -left-4 w-72 h-72 bg-primary-green/10 rounded-full filter blur-xl opacity-70 animate-blob"></div>
                                <div class="absolute top-0 -right-4 w-72 h-72 bg-accent-blue/10 rounded-full filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                                <div class="absolute -bottom-8 left-20 w-72 h-72 bg-accent-lime/10 rounded-full filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                            </div>
                            <div class="relative z-10" id="main-view-content">
                                ${renderMainContent()}
                            </div>
                         </main>`;
    } else {
        contentHtml += renderWelcomeView();
    }

    contentHtml += `</div>`;
    container.innerHTML = contentHtml;

    renderModals();
    addEventListeners();
    
    // If AI planner view is active, add its listeners
    if(state.showFullDashboard && state.activeView === 'diet') {
        const dietForm = document.getElementById('diet-planner-form');
        if(dietForm) dietForm.addEventListener('submit', handleGetDietPlan);
    }
}

function renderMainContent() {
    switch (state.activeView) {
        case 'home': return renderDashboardHome();
        case 'profile': return renderProfileView();
        case 'appointments': return renderAppointmentsView();
        case 'records': 
            fetchMedicalRecords();
            return renderRecordsView();
        case 'prescriptions': return renderPrescriptionsView();
        case 'doctors': 
            fetchDoctors();
            return renderDoctorsView();
        case 'diet': return renderAiDietPlanner();
        case 'search': return renderSearchResultsView();
        default: return renderDashboardHome();
    }
}

function renderHeader() {
    return `
    <header class="bg-white/80 backdrop-blur-sm shadow-sm p-3 flex justify-between items-center flex-shrink-0 z-20 border-b border-gray-200/80">
        <button id="header-logo-btn" class="flex items-center space-x-2" aria-label="Go to welcome screen">
            <svg class="w-10 h-10" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M50 0L95.1 19.5V56.2C95.1 82 75.8 100 50 100C24.2 100 4.9 82 4.9 56.2V19.5L50 0Z" fill="#27C690"></path><path d="M50 83.3C50 83.3 68.8 70.8 68.8 56.2V33.2L50 25L31.2 33.2V56.2C31.2 70.8 50 83.3 50 83.3Z" fill="white"></path><path d="M55.2 46.9H51V42.7C51 42.1 50.5 41.7 50 41.7C49.5 41.7 49 42.1 49 42.7V46.9H44.8C44.3 46.9 43.8 47.3 43.8 47.9C43.8 48.5 44.3 48.9 44.8 48.9H49V53.1C49 53.7 49.5 54.1 50 54.1C50.5 54.1 51 53.7 51 53.1V48.9H55.2C55.7 48.9 56.2 48.5 56.2 47.9C56.2 47.3 55.7 46.9 55.2 46.9Z" fill="#27C690"></path></svg>
            <span class="text-xl font-bold text-gray-800 tracking-wide">Health Hub</span>
        </button>
        <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3 rounded-full p-1 pr-3 bg-gray-100/0">
                <div class="w-10 h-10 bg-primary-green rounded-full p-0.5 flex-shrink-0 ring-2 ring-white shadow-md">
                    ${state.user.avatar ? `<img src="${state.user.avatar}" alt="User Avatar" class="w-full h-full rounded-full object-cover">` : `<svg class="text-white" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M10 40 Q20 30, 30 42 C 25 55, 10 55, 10 40 Z" fill="#FFCCBC" transform="rotate(-15, 20, 45)"></path><path d="M90 40 Q80 30, 70 42 C 75 55, 90 55, 90 40 Z" fill="#FFCCBC" transform="rotate(15, 80, 45)"></path><path d="M50 15 L85 30 V 65 C 85 85, 65 95, 50 95 C 35 95, 15 85, 15 65 V 30 Z" fill="#27C690"></path><rect x="44" y="42" width="12" height="26" rx="2" fill="white"></rect><rect x="37" y="49" width="26" height="12" rx="2" fill="white"></rect><g transform="translate(0, -10)"><circle cx="50" cy="35" r="8" fill="#FFEB3B"></circle><path d="M42 45 C 42 55, 58 55, 58 45 Z" fill="#42A5F5"></path></g></svg>`}
                </div>
                <div class="text-left hidden sm:block">
                    <div class="font-semibold text-sm text-gray-800">${state.user.name}</div>
                    <div class="text-xs text-gray-500">${state.user.healthId}</div>
                </div>
            </div>
            <button id="logout-btn" class="text-sm text-red-600 hover:bg-red-50 font-semibold py-2 px-3 rounded-md transition-colors" aria-label="Logout">Logout</button>
        </div>
    </header>`;
}

function renderSidebar() {
    const navItems = [
        { id: 'home', label: 'Dashboard', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>` },
        { id: 'profile', label: 'My Profile', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>` },
        { id: 'appointments', label: 'Appointments', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>` },
        { id: 'records', label: 'Medical Records', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>` },
        { id: 'prescriptions', label: 'Prescriptions', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>` },
        { id: 'doctors', label: 'My Doctors', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>` },
        { id: 'diet', label: 'AI Diet Planner', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 117.07-7.072"></path><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>` },
    ];
    return `
    <aside class="w-64 bg-white/90 backdrop-blur-sm p-4 border-r border-gray-200/80 flex flex-col flex-shrink-0">
        <div class="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-2">Menu</div>
        <nav class="flex flex-col space-y-2">
            ${navItems.map(item => `
                <button
                    data-viewid="${item.id}"
                    class="nav-btn flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:translate-x-1 ${
                        state.activeView === item.id 
                        ? 'bg-primary-green text-white shadow-lg' 
                        : 'text-gray-600 hover:bg-light-green'
                    }"
                    aria-current="${state.activeView === item.id}"
                >
                    ${item.icon}
                    <span>${item.label}</span>
                </button>
            `).join('')}
        </nav>
    </aside>`;
}

function renderWelcomeView() {
     const StatCard = ({ icon, title, value, colorClass }) => `
        <div class="p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-105 ${colorClass}">
            <div class="flex items-center justify-between text-white">
                <div class="flex flex-col">
                    <span class="text-4xl font-bold">${value}</span>
                    <span class="text-sm font-semibold opacity-80">${title}</span>
                </div>
                ${icon}
            </div>
        </div>
    `;

    return `
    <main class="flex-grow flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-gradient-to-br from-light-green via-teal-50 to-blue-50">
        <div class="absolute inset-0 opacity-20" style="background-image: url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%2327C690\\' fill-opacity=\\'0.4\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
        <div class="z-10 relative max-w-4xl mx-auto">
            <h1 class="text-5xl font-black text-gray-800">Welcome Back, ${state.user.name.split(' ')[0]}!</h1>
            <p class="text-lg text-gray-600 mt-4 max-w-xl mx-auto">Here's a quick summary of your health dashboard.</p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
               ${StatCard({ 
                   icon: `<svg class="w-16 h-16 opacity-30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12H6l.462-1.42a1 1 0 011.916.038L9 12l1.09-3.273a1 1 0 011.838-.052L13 12l.83-2.5a1 1 0 011.9.06L17 12h3.75"></path></svg>`, 
                   title: "Upcoming Appointments", 
                   value: state.user.appointments?.length || 0, 
                   colorClass: "bg-gradient-to-br from-brand-blue to-accent-blue" 
               })}
               ${StatCard({ 
                   icon: `<svg class="w-16 h-16 opacity-30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 3v.01M9 12v5a2 2 0 002 2h2a2 2 0 002-2v-5m0 0V3m0 0h.01M6 12a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H8a2 2 0 01-2-2v-5zM4 9h16"></path><path stroke-linecap="round" stroke-linejoin="round" d="M12 19v3m0 0l-2-2m2 2l2-2"></path></svg>`, 
                   title: "Medical Records", 
                   value: state.user.medicalRecords?.length || 0, 
                   colorClass: "bg-gradient-to-br from-brand-purple to-purple-400" 
               })}
               ${StatCard({ 
                   icon: `<svg class="w-16 h-16 opacity-30" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`, 
                   title: "Active Prescriptions", 
                   value: state.user.prescriptions?.length || 0, 
                   colorClass: "bg-gradient-to-br from-primary-green to-teal-400" 
               })}
            </div>

            <button 
                id="go-to-full-dashboard-btn"
                class="mt-12 px-8 py-3 bg-primary-green text-white font-bold rounded-lg shadow-xl hover:bg-primary-green-dark transition-all duration-300 transform hover:scale-105"
            >
                Go To Full Dashboard
            </button>
        </div>
    </main>`;
}

function renderDashboardHome() { return `<div>Dashboard Home View</div>`; }
function renderProfileView() { return `<div>Profile View</div>`; }
function renderAppointmentsView() { return `<div>Appointments View</div>`; }
function renderRecordsView() {
    let content;
    if (state.isLoadingRecords) {
        content = `<div class="flex items-center justify-center h-40">
                       <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
                   </div>`;
    } else if (state.recordsError) {
        content = `<div class="text-center text-red-500 py-8">
                       <h3 class="text-lg font-semibold">Error</h3>
                       <p class="text-sm">${state.recordsError}</p>
                   </div>`;
    } else if (state.medicalRecords.length > 0) {
        content = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                       ${state.medicalRecords.map((record, index) => renderMedicalRecordCard(record, index)).join('')}
                   </div>`;
    } else {
        content = `<div class="text-center text-gray-500 py-8">
                       <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                       <h3 class="text-lg font-semibold">No Medical Records Found</h3>
                       <p class="text-sm">You have not uploaded any medical records yet.</p>
                   </div>`;
    }

    return `
    <div>
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl font-bold text-gray-800">Medical Records</h1>
            <button id="add-record-btn" class="flex items-center gap-2 px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-sm hover:bg-primary-green-dark transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                Add New Record
            </button>
        </div>
        <div class="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md min-h-[200px]">
            <h2 class="text-xl font-bold text-gray-700 mb-4">Your Records</h2>
            ${content}
        </div>
    </div>`;
}
function renderMedicalRecordCard(record, index) {
    const color = index % 2 === 0 ? 'lime' : 'blue';
    const gradientClass = color === 'lime' 
        ? 'from-grad-lime-from to-grad-lime-to'
        : 'from-grad-blue-from to-grad-blue-to';

    return `
        <div class="bg-gradient-to-br ${gradientClass} text-white rounded-lg shadow-lg p-4 flex flex-col justify-between transition-transform transform hover:-translate-y-1">
            <div class="flex items-start justify-between">
                <div>
                    <h4 class="font-bold text-gray-800 truncate pr-2">${record.name}</h4>
                     <div class="flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 bg-white/30 text-slate-800 text-xs font-semibold rounded-full">${record.category}</span>
                        <p class="text-sm text-slate-700 truncate" title="${record.disease}">for ${record.disease}</p>
                    </div>
                </div>
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div class="mt-4 flex justify-between items-center">
                <p class="text-xs text-slate-700 font-medium">${record.files.length} file(s)</p>
                <div class="flex items-center gap-2">
                    <button data-record-id="${record.id}" class="preview-record-btn px-4 py-1.5 bg-white/90 text-primary-green font-bold rounded-lg hover:bg-white transition text-sm shadow-md">
                        Preview
                    </button>
                </div>
            </div>
        </div>`;
}

function renderPrescriptionsView() { return `<div>Prescriptions View</div>`; }
function renderDoctorsView() { return `<div>Doctors View</div>`; }
function renderAiDietPlanner() { return `
    <div class="bg-dark-bg text-dark-text p-6 rounded-2xl shadow-2xl w-full mx-auto font-sans border border-dark-subtext/20">
        <header class="flex justify-center items-center gap-2">
            <h1 class="text-lg font-bold tracking-widest text-dark-text">MEDI-MIND AI DIET RECOMMENDER</h1>
        </header>
        <div class="bg-dark-card p-4 rounded-lg mt-4">
             <form id="diet-planner-form">
                <label class="text-xs font-bold text-dark-subtext">ENTER YOUR HEALTH CONDITION</label>
                <div class="flex gap-4 mt-2">
                    <input
                        type="text"
                        name="healthCondition"
                        placeholder="E.g., Type 2 Diabetes, High Cholesterol, Keto Diet, Vegan"
                        class="flex-grow bg-dark-bg border border-dark-subtext/20 rounded-lg px-4 py-2.5 text-sm placeholder-dark-subtext/50 focus:outline-none focus:ring-2 focus:ring-dark-accent"
                    />
                    <button
                        type="submit"
                        class="px-5 py-2.5 bg-dark-accent rounded-lg text-sm font-bold text-dark-bg hover:bg-opacity-80 transition-opacity"
                    >
                        GET DIET PLAN
                    </button>
                </div>
            </form>
        </div>
         <div id="diet-plan-error" class="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-sm mt-4 hidden"></div>
         <div id="diet-plan-results" class="mt-4"></div>
    </div>`; 
}
function renderSearchResultsView() { return `<div>Search Results View</div>`; }

function renderModals() {
    // Remove existing modals before re-rendering
    document.querySelectorAll('.modal-container').forEach(el => el.remove());

    if (state.showUploadModal) {
        const modal = document.createElement('div');
        modal.className = 'modal-container fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4';
        modal.id = 'upload-modal';
        modal.innerHTML = renderUploadModal();
        document.body.appendChild(modal);
    }
}

function renderUploadModal() {
     const labelStyle = "block text-sm font-bold text-gray-800 mb-1";
     const inputStyle = "block w-full px-3 py-2 bg-input-bg border-transparent rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green sm:text-sm text-gray-900";
    
    return `
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <form id="upload-record-form" class="space-y-4">
            <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 class="text-xl font-bold text-gray-800">Upload a New Medical Record</h3>
                <button type="button" class="close-modal-btn p-2 rounded-full hover:bg-gray-100">&times;</button>
            </div>
            <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                    <label for="recordName" class="${labelStyle}">Record Name</label>
                    <input id="recordName" name="recordName" type="text" class="${inputStyle}" placeholder="e.g., Blood Test Results" required />
                </div>
                <div>
                    <label for="category" class="${labelStyle}">Category</label>
                    <select id="category" name="category" class="${inputStyle}" required>
                        ${MEDICAL_RECORD_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="disease" class="${labelStyle}">Related Condition/Disease</label>
                    <input id="disease" name="disease" type="text" class="${inputStyle}" placeholder="e.g., Annual Checkup, Fever" required />
                </div>
                <div>
                    <label class="${labelStyle}">Select File(s)</label>
                    <input id="fileUpload" type="file" multiple class="hidden" />
                    <button type="button" id="browse-files-btn" class="w-full flex items-center justify-center gap-2 mt-1 px-4 py-3 bg-white text-gray-600 font-semibold rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-green hover:text-primary-green transition-colors">
                        Choose Files
                    </button>
                    <div id="file-list" class="mt-2 space-y-2"></div>
                </div>
            </div>
            <div id="upload-error" class="text-red-500 text-sm text-center font-semibold px-6 hidden"></div>
            <div class="p-4 bg-gray-50 flex justify-end">
                <button type="submit" class="w-full md:w-auto flex justify-center items-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-green hover:bg-primary-green-dark">
                    Upload Record
                </button>
            </div>
        </form>
    </div>`;
}

// --- EVENT LISTENERS & LOGIC ---

function addEventListeners() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const headerLogoBtn = document.getElementById('header-logo-btn');
    if(headerLogoBtn) headerLogoBtn.addEventListener('click', () => {
        state.showFullDashboard = false;
        state.activeView = 'home';
        render();
    });

    const goToDashboardBtn = document.getElementById('go-to-full-dashboard-btn');
    if (goToDashboardBtn) {
        goToDashboardBtn.addEventListener('click', () => {
            state.showFullDashboard = true;
            render();
        });
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.activeView = btn.dataset.viewid;
            render();
        });
    });

    const addRecordBtn = document.getElementById('add-record-btn');
    if (addRecordBtn) {
        addRecordBtn.addEventListener('click', () => {
            state.showUploadModal = true;
            render();
        });
    }

    document.querySelectorAll('.preview-record-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const recordId = btn.dataset.recordId;
            const record = state.medicalRecords.find(r => r.id === recordId);
            if (record) {
                // For simplicity, we'll just alert for now. A modal would be better.
                alert(`Previewing: ${record.name}\nFiles: ${record.files.map(f => f.name).join(', ')}`);
            }
        });
    });

    // Modal listeners
    const uploadModal = document.getElementById('upload-modal');
    if(uploadModal) {
        uploadModal.addEventListener('click', (e) => {
            if (e.target.id === 'upload-modal' || e.target.closest('.close-modal-btn')) {
                state.showUploadModal = false;
                render();
            }
        });
        
        document.getElementById('browse-files-btn').addEventListener('click', () => {
            document.getElementById('fileUpload').click();
        });

        document.getElementById('fileUpload').addEventListener('change', handleFileSelection);
        document.getElementById('upload-record-form').addEventListener('submit', handleUploadSubmit);
    }
}

let selectedFiles = [];

function handleFileSelection(event) {
    const fileListDiv = document.getElementById('file-list');
    selectedFiles.push(...event.target.files);
    
    fileListDiv.innerHTML = selectedFiles.map(file => `
        <div class="flex items-center justify-between py-2 px-3 text-sm bg-gray-50 rounded-md">
            <span class="text-gray-800 font-medium truncate">${file.name}</span>
            <button type="button" data-filename="${file.name}" class="remove-file-btn p-1 text-gray-400 rounded-full hover:bg-red-100 hover:text-red-600">
                &times;
            </button>
        </div>
    `).join('');

    document.querySelectorAll('.remove-file-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filename = e.currentTarget.dataset.filename;
            selectedFiles = selectedFiles.filter(f => f.name !== filename);
            e.currentTarget.parentElement.remove();
        });
    });
}

async function handleUploadSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('upload-error');
    const submitBtn = form.querySelector('button[type="submit"]');
    errorEl.textContent = '';
    errorEl.classList.add('hidden');

    if (selectedFiles.length === 0) {
        errorEl.textContent = 'Please select at least one file.';
        errorEl.classList.remove('hidden');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Uploading...';

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    try {
        const filePromises = selectedFiles.map(file => toBase64(file).then(content => ({ name: file.name, content })));
        const files = await Promise.all(filePromises);

        const newRecordData = {
            name: form.recordName.value,
            category: form.category.value,
            disease: form.disease.value,
            files: files,
            isLocked: false, // Simplified for now
        };

        await addMedicalRecord(state.user.healthId, newRecordData);
        createToast('Record uploaded successfully!');
        state.showUploadModal = false;
        selectedFiles = [];
        await fetchMedicalRecords();
        render();

    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload Record';
    }
}

async function fetchMedicalRecords() {
    if(state.isLoadingRecords || state.medicalRecords.length > 0) return; // Prevent re-fetching
    state.isLoadingRecords = true;
    render(); 
    try {
        const records = await getMedicalRecords(state.user.healthId);
        state.medicalRecords = records;
    } catch (error) {
        state.recordsError = 'Failed to load medical records.';
        console.error(error);
    } finally {
        state.isLoadingRecords = false;
        // Re-render only if the view is still 'records'
        if(state.activeView === 'records') {
            render();
        }
    }
}

async function fetchDoctors() {
    // Implement fetching doctors linked to the patient
}


async function handleGetDietPlan(e) {
    e.preventDefault();
    const form = e.target;
    const healthCondition = form.healthCondition.value;
    const resultsDiv = document.getElementById('diet-plan-results');
    const errorDiv = document.getElementById('diet-plan-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    resultsDiv.innerHTML = '';
    errorDiv.classList.add('hidden');

    if (!healthCondition.trim()) {
        errorDiv.textContent = 'Please enter a health condition.';
        errorDiv.classList.remove('hidden');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Generating...';
    resultsDiv.innerHTML = `<div class="text-center p-4">Generating your personalized diet plan...</div>`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a simple, one-day healthy diet plan for a person with ${healthCondition}. Provide a meal for Morning, Afternoon, Evening, and Night. For each, give a simple meal name and a one-sentence description. Format the output as a simple list.`,
        });

        const planText = response.text.replace(/\n/g, '<br>');
        resultsDiv.innerHTML = `<div class="p-4 bg-dark-card rounded-lg">${planText}</div>`;

    } catch (err) {
        console.error("Error fetching diet plan:", err);
        errorDiv.textContent = "Sorry, couldn't generate a plan. Please try again later.";
        errorDiv.classList.remove('hidden');
        resultsDiv.innerHTML = '';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'GET DIET PLAN';
    }
}


// --- INITIALIZATION ---

async function init() {
    const user = await checkSession([UserRole.PATIENT]);
    if (user) {
        state.user = user;
        render();
    }
}

document.addEventListener('DOMContentLoaded', init);