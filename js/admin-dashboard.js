import { checkSession, handleLogout, createToast } from './common.js';
import { getAllUsers, deleteUser, adminAddUser } from './db.js';

const UserRole = { ADMIN: 'Admin', PATIENT: 'Patient', DOCTOR: 'Doctor' };

const state = {
    admin: null,
    activeView: 'dashboard', // 'dashboard', 'patients', 'doctors'
    users: [],
    isLoading: true,
    error: '',
    searchQuery: '',
    viewingUser: null,
    isAddModalOpen: false,
    modalUserType: UserRole.PATIENT, // To control which 'add' modal opens
};

// --- RENDER FUNCTIONS ---

function render() {
    if (!state.admin) return;
    const container = document.getElementById('admin-dashboard-container');
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
        <span class="text-xl font-bold tracking-wider">Healthub Admin</span>
      </div>
      <div class="flex items-center space-x-4">
        <div class="text-right">
          <div class="font-semibold text-sm">${state.admin.name}</div>
          <div class="text-xs text-dark-subtext">${state.admin.role}</div>
        </div>
        <button id="logout-btn" class="text-sm text-red-400 hover:bg-red-500/10 font-semibold py-2 px-3 rounded-md transition-colors" aria-label="Logout">Logout</button>
      </div>
    </header>`;
}

function renderSidebar() {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>` },
        { id: 'patients', label: 'Patient Management', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>` },
        { id: 'doctors', label: 'Doctor Management', icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>` },
    ];
    return `
    <aside class="w-64 bg-dark-card/90 backdrop-blur-sm p-4 border-r border-dark-subtext/20 flex flex-col flex-shrink-0">
      <div class="text-dark-subtext text-xs font-semibold uppercase tracking-wider mb-3 px-2">Menu</div>
      <nav class="flex flex-col space-y-2">
        ${navItems.map(item => `
          <button data-viewid="${item.id}" class="nav-btn flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:translate-x-1 ${
              state.activeView === item.id ? 'bg-dark-accent text-dark-bg shadow-lg' : 'text-dark-subtext hover:bg-dark-bg'
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
        case 'patients':
        case 'doctors':
            return renderUserManagementView(state.activeView);
        case 'dashboard':
        default:
            return renderDashboardHome();
    }
}

function renderDashboardHome() {
    const totalUsers = state.users.length;
    const totalPatients = state.users.filter(u => u.role === UserRole.PATIENT).length;
    const totalDoctors = state.users.filter(u => u.role === UserRole.DOCTOR).length;
    
    return `
    <div class="space-y-8">
        <div>
            <h1 class="text-3xl font-bold">Admin Dashboard</h1>
            <p class="text-md text-dark-subtext mt-1">Platform Overview & Statistics</p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div class="bg-dark-card p-5 rounded-lg shadow-lg flex items-center space-x-4 border border-dark-subtext/10">
                <div class="p-3 rounded-lg bg-dark-accent/10"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
                <div><div class="text-2xl font-bold text-dark-text">${totalUsers}</div><div class="text-sm text-dark-subtext">Total Users</div></div>
            </div>
            <div class="bg-dark-card p-5 rounded-lg shadow-lg flex items-center space-x-4 border border-dark-subtext/10">
                 <div class="p-3 rounded-lg bg-dark-accent/10"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                <div><div class="text-2xl font-bold text-dark-text">${totalPatients}</div><div class="text-sm text-dark-subtext">Total Patients</div></div>
            </div>
             <div class="bg-dark-card p-5 rounded-lg shadow-lg flex items-center space-x-4 border border-dark-subtext/10">
                 <div class="p-3 rounded-lg bg-dark-accent/10"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>
                <div><div class="text-2xl font-bold text-dark-text">${totalDoctors}</div><div class="text-sm text-dark-subtext">Total Doctors</div></div>
            </div>
        </div>
    </div>`;
}

function renderUserManagementView(viewType) {
    const isPatientsView = viewType === 'patients';
    const title = isPatientsView ? 'Patient' : 'Doctor';
    const usersToDisplay = state.users.filter(u => u.role === (isPatientsView ? UserRole.PATIENT : UserRole.DOCTOR));

    const filteredUsers = usersToDisplay.filter(user =>
        user.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        user.healthId.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(state.searchQuery.toLowerCase()))
    );

    return `
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold">${title} Management</h1>
                <p class="text-md text-dark-subtext mt-1">Manage all ${title.toLowerCase()} accounts.</p>
            </div>
            <button id="add-user-btn" class="flex items-center gap-2 px-4 py-2 bg-dark-accent text-dark-bg font-semibold rounded-lg shadow-sm hover:bg-opacity-80 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
                Add ${title}
            </button>
        </div>
        <div class="bg-dark-card p-4 rounded-lg shadow-lg">
            <div class="relative mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-subtext pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input id="search-input" type="search" placeholder="Search by name, Health ID, or email..." value="${state.searchQuery}" class="w-full pl-12 pr-4 py-2.5 bg-dark-bg border border-dark-subtext/20 rounded-lg focus:ring-2 focus:ring-dark-accent focus:outline-none transition-all">
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left table-auto">
                    <thead>
                        <tr class="border-b border-dark-subtext/20 text-xs text-dark-subtext uppercase">
                            <th class="p-3">Name</th>
                            <th class="p-3">Health ID / Email</th>
                            <th class="p-3 hidden md:table-cell">Mobile No.</th>
                            <th class="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredUsers.map(user => `
                            <tr data-userid="${user.healthId}" class="user-row border-b border-dark-subtext/10 text-sm hover:bg-dark-bg cursor-pointer">
                                <td class="p-3 font-medium">${user.name}</td>
                                <td class="p-3 text-dark-subtext">
                                    <div>${user.healthId}</div>
                                    <div class="text-xs truncate max-w-[150px]">${user.email || 'N/A'}</div>
                                </td>
                                <td class="p-3 hidden md:table-cell text-dark-subtext">${user.mobileNo || 'N/A'}</td>
                                <td class="p-3 text-right">
                                    <button data-userid="${user.healthId}" class="delete-user-btn p-2 text-dark-subtext hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors" title="Delete ${user.name}">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                 ${filteredUsers.length === 0 ? `<div class="text-center py-10 text-dark-subtext">No users found.</div>` : ''}
            </div>
        </div>
    </div>`;
}

function renderModals() {
    document.querySelectorAll('.modal-container').forEach(el => el.remove());

    if (state.viewingUser) {
        // ... render user detail modal ...
    }
    
    if (state.isAddModalOpen) {
        const modal = document.createElement('div');
        modal.className = 'modal-container fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4';
        modal.id = 'add-user-modal';
        modal.innerHTML = renderAddUserModal();
        document.body.appendChild(modal);
    }
}

function renderAddUserModal() {
     const isPatient = state.modalUserType === UserRole.PATIENT;
     const title = isPatient ? 'Patient' : 'Doctor';
     const inputStyle = "block w-full px-3 py-2 bg-dark-bg border border-dark-subtext/20 rounded-md placeholder-dark-subtext/50 focus:outline-none focus:ring-2 focus:ring-dark-accent sm:text-sm text-dark-text";
     const labelStyle = "block text-sm font-bold text-dark-subtext mb-1";
    
     return `
    <div class="bg-dark-card rounded-lg shadow-xl w-full max-w-lg">
        <div class="flex justify-between items-center p-4 border-b border-dark-subtext/20">
            <h2 class="text-xl font-bold">Add New ${title}</h2>
            <button type="button" class="close-modal-btn p-2 rounded-full hover:bg-dark-bg">&times;</button>
        </div>
        <form id="add-user-form">
            <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="${labelStyle}">Full Name</label><input type="text" name="name" class="${inputStyle}" required /></div>
                    <div><label class="${labelStyle}">Email</label><input type="email" name="email" class="${inputStyle}" required /></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="${labelStyle}">Mobile No.</label><input type="tel" name="mobileNo" class="${inputStyle}" required /></div>
                    <div><label class="${labelStyle}">Set Password</label><input type="password" name="password" class="${inputStyle}" required /></div>
                </div>
                ${!isPatient ? `
                <hr class="border-dark-subtext/20" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="${labelStyle}">Specialization</label><input type="text" name="specialization" placeholder="e.g., Cardiologist" class="${inputStyle}" /></div>
                    <div><label class="${labelStyle}">Experience</label><input type="text" name="experience" placeholder="e.g., 10 years" class="${inputStyle}" /></div>
                </div>
                ` : ''}
                <div id="add-user-error" class="text-red-400 text-sm hidden"></div>
            </div>
            <div class="px-6 py-4 bg-dark-bg/50 rounded-b-lg flex justify-end gap-3">
                <button type="button" class="close-modal-btn px-4 py-2 text-sm font-medium rounded-md hover:bg-dark-bg">Cancel</button>
                <button type="submit" class="px-4 py-2 text-sm font-medium text-dark-bg bg-dark-accent rounded-md shadow-sm hover:bg-opacity-80">Create ${title}</button>
            </div>
        </form>
    </div>`;
}

// --- EVENT LISTENERS & LOGIC ---

function addEventListeners() {
    document.getElementById('logout-btn')?.addEventListener('click', handleLogout);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.activeView = btn.dataset.viewid;
            state.searchQuery = ''; // Reset search when changing view
            render();
        });
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            state.searchQuery = e.target.value;
            render();
        });
    }

    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const userId = e.currentTarget.dataset.userid;
            const user = state.users.find(u => u.healthId === userId);
            if(user) handleDeleteUser(user);
        });
    });
    
    document.getElementById('add-user-btn')?.addEventListener('click', () => {
        state.modalUserType = state.activeView === 'patients' ? UserRole.PATIENT : UserRole.DOCTOR;
        state.isAddModalOpen = true;
        render();
    });
    
    const addUserModal = document.getElementById('add-user-modal');
    if(addUserModal) {
        addUserModal.addEventListener('click', e => {
            if(e.target.id === 'add-user-modal' || e.target.closest('.close-modal-btn')) {
                state.isAddModalOpen = false;
                render();
            }
        });
        document.getElementById('add-user-form').addEventListener('submit', handleAddUserSubmit);
    }
}

async function handleAddUserSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.getElementById('add-user-error');
    const submitBtn = form.querySelector('button[type="submit"]');
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
    
    try {
        const mobileNo = form.mobileNo.value;
        const randomSuffix = String(Math.floor(Math.random() * 900) + 100);
        const healthId = `${state.modalUserType === UserRole.DOCTOR ? 'DOC' : 'HID'}${mobileNo.slice(-4)}${randomSuffix}`;

        const newUser = {
            healthId,
            name: form.name.value,
            email: form.email.value,
            mobileNo: mobileNo,
            password: form.password.value,
            role: state.modalUserType,
            specialization: form.specialization?.value,
        };

        await adminAddUser(newUser);
        createToast(`${state.modalUserType} added successfully!`);
        state.isAddModalOpen = false;
        await fetchUsers(); // This calls render
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.textContent = `Create ${state.modalUserType}`;
    }
}


async function handleDeleteUser(user) {
    if (window.confirm(`Are you sure you want to delete user "${user.name}"?`)) {
        try {
            await deleteUser(user.healthId);
            createToast(`User ${user.name} has been deleted.`);
            await fetchUsers(); // This calls render
        } catch (err) {
            state.error = err.message;
            render();
        }
    }
}

async function fetchUsers() {
    state.isLoading = true;
    render();
    try {
        const allUsers = await getAllUsers();
        state.users = allUsers.filter(u => u.role !== UserRole.ADMIN);
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
    const admin = await checkSession([UserRole.ADMIN]);
    if (admin) {
        state.admin = admin;
        await fetchUsers();
    }
}

document.addEventListener('DOMContentLoaded', init);