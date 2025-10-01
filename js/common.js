import { getUserById } from './db.js';

export async function checkSession(allowedRoles = []) {
    const loggedInUserId = sessionStorage.getItem('loggedInUser');
    if (!loggedInUserId) {
        window.location.href = 'index.html';
        return null;
    }

    try {
        const user = await getUserById(loggedInUserId);
        if (!user || (allowedRoles.length > 0 && !allowedRoles.includes(user.role))) {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
            return null;
        }
        return user;
    } catch (error) {
        console.error("Session check failed:", error);
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
        return null;
    }
}

export function handleLogout() {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
}

export function createToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 bg-gray-800 text-white py-3 px-5 rounded-lg shadow-xl flex items-center animate-fade-in-up z-50';
    toast.innerHTML = `
      <p class="text-sm font-medium">${message}</p>
      <button class="ml-4 p-1 rounded-full hover:bg-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    `;
    document.body.appendChild(toast);

    const closeButton = toast.querySelector('button');
    closeButton.addEventListener('click', () => {
        toast.remove();
    });

    setTimeout(() => {
        toast.remove();
    }, 5000);
}