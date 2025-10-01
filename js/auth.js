import { authenticateUser, authenticateAdmin, registerUser, getUserById, updateUser } from './db.js';

const AuthMode = {
  LOGIN: 'login',
  REGISTER: 'register',
  FORGOT_PASSWORD: 'forgotPassword',
};

const UserRole = {
  PATIENT: 'Patient',
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
};

const SECURITY_QUESTIONS = [
  'What was your first pet\'s name?',
  'What is your mother\'s maiden name?',
  'What city were you born in?',
  'What was the name of your elementary school?',
  'What is your favorite book?',
];

const ADMIN_EMAIL = 'gohealthhub.360@gmail.com';

const mainContent = document.getElementById('main-content');
const registerFormContainer = document.getElementById('register-form-container');

let currentAuthMode = AuthMode.LOGIN;
let currentRole = UserRole.PATIENT;
let forgotPasswordStep = 1;
let forgotPasswordUser = null;

function handleLoginSuccess(user) {
    sessionStorage.setItem('loggedInUser', user.healthId);
    switch (user.role) {
        case UserRole.ADMIN:
            window.location.href = 'admin-dashboard.html';
            break;
        case UserRole.DOCTOR:
            window.location.href = 'doctor-dashboard.html';
            break;
        case UserRole.PATIENT:
        default:
            window.location.href = 'patient-dashboard.html';
            break;
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const loginId = form.loginId.value;
    const password = form.password.value;
    const errorEl = form.querySelector('.error-message');
    const submitBtn = form.querySelector('button[type="submit"]');

    errorEl.textContent = '';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Logging in...`;

    try {
        let user;
        if (currentRole === UserRole.ADMIN) {
            user = await authenticateAdmin(loginId.trim(), password);
        } else {
            user = await authenticateUser(loginId.trim(), password);
            if (user.role !== currentRole) {
                throw new Error(`You are not registered as a ${currentRole}.`);
            }
        }
        handleLoginSuccess(user);
    } catch (err) {
        errorEl.textContent = err.message;
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = form.querySelector('.error-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    errorEl.textContent = '';
    
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (password !== confirmPassword) {
        errorEl.textContent = "Passwords do not match.";
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    const mobileNo = form.mobileNo.value;
    const randomSuffix = String(Math.floor(Math.random() * 900) + 100);
    const healthId = `HID${mobileNo.slice(-4)}${randomSuffix}`;

    const emergencyContact = form.emergencyFirstName.value && form.emergencyMobile.value ? {
        name: `${form.emergencyFirstName.value} ${form.emergencyLastName.value}`,
        mobile: form.emergencyMobile.value,
        email: form.emergencyEmail.value,
        relation: form.emergencyRelation.value,
        address: {
            address1: form.emergencyAddress1.value,
            address2: form.emergencyAddress2.value,
            landmark: form.emergencyLandmark.value,
            district: form.emergencyDistrict.value,
            pincode: form.emergencyPincode.value,
            state: form.emergencyState.value,
        }
    } : undefined;

    const permanentDiseases = Array.from(form.querySelectorAll('.disease-entry')).map(entry => ({
        name: entry.querySelector('input[name="diseaseName"]').value,
        years: entry.querySelector('input[name="diseaseYears"]').value,
    })).filter(d => d.name.trim() !== '');

    const newUser = {
        healthId,
        name: [form.firstName.value, form.middleName.value, form.lastName.value].filter(Boolean).join(' '),
        mobileNo: form.mobileNo.value,
        password: form.password.value,
        email: form.email.value,
        birthdate: form.birthdate.value,
        aadharNo: form.aadharNo.value,
        bloodGroup: form.bloodGroup.value,
        address: {
            address1: form.address1.value,
            address2: form.address2.value,
            landmark: form.landmark.value,
            district: form.district.value,
            pincode: form.pincode.value,
            state: form.state.value,
        },
        securityQuestion: form.securityQuestion.value,
        securityAnswer: (form.securityAnswer.value).toLowerCase(),
        permanentDiseases,
        emergencyContact,
        role: UserRole.PATIENT,
    };

    try {
        const registeredUser = await registerUser(newUser);
        alert(`Registration successful! Your new Health ID is: ${healthId}.\nYou will now be logged in.`);
        handleLoginSuccess(registeredUser);
    } catch(err) {
        errorEl.textContent = err.message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
    }
}

async function handleForgotPassword(e) {
    e.preventDefault();
    const form = e.target;
    const errorEl = form.querySelector('.error-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    errorEl.textContent = '';
    submitBtn.disabled = true;

    if (forgotPasswordStep === 1) {
        submitBtn.textContent = 'Searching...';
        const userId = form.userId.value;
        try {
            const foundUser = await getUserById(userId.trim());
            if (foundUser && foundUser.securityQuestion) {
                forgotPasswordUser = foundUser;
                forgotPasswordStep = 2;
                render();
            } else {
                errorEl.textContent = "User ID not found or no security question is set for this account.";
            }
        } catch (err) {
            errorEl.textContent = err.message;
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continue';
        }
    } else if (forgotPasswordStep === 2) {
        const securityAnswer = form.securityAnswer.value;
        if (forgotPasswordUser && securityAnswer.trim().toLowerCase() === forgotPasswordUser.securityAnswer) {
            forgotPasswordStep = 3;
            render();
        } else {
            errorEl.textContent = "The answer is incorrect. Please try again.";
        }
        submitBtn.disabled = false;
    } else if (forgotPasswordStep === 3) {
        submitBtn.textContent = 'Saving...';
        const newPassword = form.newPassword.value;
        const confirmPassword = form.confirmPassword.value;
        if (newPassword !== confirmPassword) {
            errorEl.textContent = "Passwords do not match!";
            submitBtn.disabled = false;
            submitBtn.textContent = 'Set New Password';
            return;
        }
        try {
            await updateUser(forgotPasswordUser.healthId, { password: newPassword });
            alert("Password has been reset successfully. Please log in.");
            currentAuthMode = AuthMode.LOGIN;
            forgotPasswordStep = 1;
            forgotPasswordUser = null;
            render();
        } catch (err) {
            errorEl.textContent = err.message;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Set New Password';
        }
    }
}

function render() {
    if (registerFormContainer) { // We are on register.html
        registerFormContainer.innerHTML = renderRegisterForm();
        addRegisterFormListeners();
    } else if (mainContent) { // We are on index.html
        switch(currentAuthMode) {
            case AuthMode.FORGOT_PASSWORD:
                mainContent.innerHTML = renderForgotPasswordPage();
                break;
            case AuthMode.LOGIN:
            default:
                mainContent.innerHTML = renderHomePage();
                break;
        }
        addAuthPageListeners();
    }
}

function addAuthPageListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const forgotPasswordForm = document.getElementById('forgot-password-form');
    if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', handleForgotPassword);

    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentRole = e.currentTarget.dataset.role;
            render();
        });
    });

    document.querySelectorAll('.auth-mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentAuthMode = e.currentTarget.dataset.mode;
            forgotPasswordStep = 1;
            forgotPasswordUser = null;
            render();
        });
    });
    
    const showPasswordBtn = document.getElementById('show-password-btn');
    if (showPasswordBtn) {
        showPasswordBtn.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        });
    }
}

function addRegisterFormListeners() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) registerForm.addEventListener('submit', handleRegister);

    document.querySelectorAll('.registration-type-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const type = e.currentTarget.dataset.type;
            document.getElementById('patient-form-fields').style.display = type === 'patient' ? 'block' : 'none';
            document.getElementById('doctor-info-fields').style.display = type === 'doctor' ? 'block' : 'none';
            document.querySelectorAll('.registration-type-btn').forEach(b => b.classList.remove('bg-primary-green', 'text-white', 'shadow-md'));
            e.currentTarget.classList.add('bg-primary-green', 'text-white', 'shadow-md');
        });
    });

    const diseaseContainer = document.getElementById('disease-container');
    document.getElementById('add-disease-btn').addEventListener('click', () => {
        const newEntry = document.createElement('div');
        newEntry.className = 'flex items-center gap-2 mb-2 disease-entry';
        newEntry.innerHTML = `
            <input name="diseaseName" type="text" placeholder="eg.diabetes" class="block w-full px-3 py-2 bg-input-bg border-transparent rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green sm:text-sm text-gray-900">
            <input name="diseaseYears" type="text" placeholder="years e.g 3" class="block w-full px-3 py-2 bg-input-bg border-transparent rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green sm:text-sm text-gray-900 w-1/3">
            <button type="button" class="remove-disease-btn p-2 rounded-full bg-red-100 text-red-600"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"></path></svg></button>
        `;
        diseaseContainer.appendChild(newEntry);
    });

    diseaseContainer.addEventListener('click', e => {
        if (e.target.closest('.remove-disease-btn')) {
            e.target.closest('.disease-entry').remove();
        }
    });

    const birthdateInput = document.getElementById('birthdate');
    birthdateInput.addEventListener('input', e => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const truncatedValue = rawValue.substring(0, 8);
        let formattedValue = truncatedValue;
        if (truncatedValue.length > 2) {
          formattedValue = `${truncatedValue.substring(0, 2)}-${truncatedValue.substring(2)}`;
        }
        if (truncatedValue.length > 4) {
          formattedValue = `${formattedValue.substring(0, 5)}-${formattedValue.substring(5)}`;
        }
        e.target.value = formattedValue;
    });
}

function renderHomePage() {
    const isEmailLogin = currentRole === UserRole.ADMIN || currentRole === UserRole.DOCTOR;
    return `
      <div class="w-full max-w-6xl grid md:grid-cols-2 gap-16 items-center">
        <div class="hidden md:flex justify-center">
            <svg class="w-full max-w-lg h-auto" viewBox="0 0 550 450" xmlns="http://www.w3.org/2000/svg">
              <defs><clipPath id="circleClip"><circle cx="275" cy="200" r="150"/></clipPath></defs>
              <rect x="150" y="70" width="250" height="260" rx="20" fill="#E6F7F5" clip-path="url(#circleClip)"/>
              <path d="M180 280 Q220 230, 260 280 T 340 280 T 420 280" stroke="#B2DFDB" stroke-width="2" fill="none" opacity="0.5" clip-path="url(#circleClip)"/>
              <path d="M170 300 Q210 250, 250 300 T 330 300 T 410 300" stroke="#B2DFDB" stroke-width="2" fill="none" opacity="0.5" clip-path="url(#circleClip)"/>
              <g transform="translate(275, 160) scale(0.9)"><path d="M0 20C-20-10 -50-10 -50 10C-50 30 -20 50 0 70C20 50 50 30 50 10C50-10 20-10 0 20Z" fill="#27C690"/><polyline points="-30,20 -15,20 -10,35 10,5 15,20 30,20" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>
              <g transform="translate(160, 200)"><circle cx="0" cy="0" r="20" fill="#4A2C2A"/><rect x="-10" y="-20" width="20" height="15" fill="#4A2C2A"/><path d="M-20 0 a20 20 0 0 1 40 0" fill="#FFE0B2"/><circle cx="-7" cy="-5" r="2" fill="#4A2C2A"/><circle cx="7" cy="-5" r="2" fill="#4A2C2A"/><rect x="-35" y="20" width="70" height="120" rx="10" fill="white"/><path d="M-35 40 L-10 20 L10 20 L35 40 Z" fill="white"/><rect x="-25" y="40" width="50" height="80" fill="#27C690"/><line x1="-35" y1="50" x2="35" y2="50" stroke="#CFD8DC" stroke-width="4"/><circle cx="-20" cy="65" r="5" fill="#CFD8DC"/><rect x="-30" y="140" width="20" height="40" fill="#27C690"/><rect x="10" y="140" width="20" height="40" fill="#27C690"/></g>
              <g transform="translate(360, 220)"><circle cx="0" cy="0" r="20" fill="#6D4C41"/><path d="M-25 0 C-25 -25 25 -25 25 0" fill="#6D4C41"/><path d="M-20 0 a20 20 0 0 1 40 0" fill="#FFE0B2"/><circle cx="-7" cy="-5" r="2" fill="#6D4C41"/><circle cx="7" cy="-5" r="2" fill="#6D4C41"/><rect x="-30" y="20" width="60" height="110" rx="10" fill="white"/><path d="M-30 40 L-10 20 L10 20 L30 40 Z" fill="white"/><rect x="-20" y="40" width="40" height="90" fill="#1A237E"/><line x1="-30" y1="50" x2="30" y2="50" stroke="#CFD8DC" stroke-width="4"/><rect x="15" y="55" width="25" height="35" rx="3" fill="#BCAAA4"/><rect x="18" y="58" width="19" height="29" fill="white"/><line x1="20" y1="65" x2="35" y2="65" stroke="#90A4AE" stroke-width="1"/><line x1="20" y1="70" x2="35" y2="70" stroke="#90A4AE" stroke-width="1"/><line x1="20" y1="75" x2="30" y2="75" stroke="#90A4AE" stroke-width="1"/><path d="M 30 50 L 38 58" stroke="#6D4C41" stroke-width="2" stroke-linecap="round"/><rect x="-25" y="130" width="15" height="30" fill="#1A237E"/><rect x="10" y="130" width="15" height="30" fill="#1A237E"/><path d="M 10 160 L 5 180 L 20 180 Z" fill="#424242"/><path d="M -25 160 L -30 180 L -15 180 Z" fill="#424242"/></g>
              <g transform="translate(100, 300)"><path d="M0 100 C 10 70, 70 70, 80 100 Z" fill="#424242"/><rect x="5" y="0" width="70" height="100" fill="#424242"/><path d="M40 0 C 10 -50, 20 -80, 5 -100" stroke="#00796B" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M40 0 C 70 -50, 60 -80, 75 -100" stroke="#00796B" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M40 -20 C 30 -60, 50 -70, 45 -90" stroke="#00796B" stroke-width="6" fill="none" stroke-linecap="round"/></g>
            </svg>
        </div>
        <div class="flex justify-center md:justify-end">
            <div class="w-full max-w-md">
                <div class="bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 border border-gray-200">
                    ${renderLoginForm(isEmailLogin)}
                </div>
            </div>
        </div>
      </div>
    `;
}

function renderLoginForm(isEmailLogin) {
    return `
    <div>
      <h2 class="text-3xl font-bold text-center text-primary-green mb-6">Login</h2>
      
      <div class="bg-role-switcher-bg rounded-lg p-1 grid grid-cols-3 gap-1 mb-6">
        <button type="button" data-role="${UserRole.PATIENT}" class="role-btn w-full py-2.5 text-sm font-semibold transition-colors duration-300 rounded-md ${currentRole === UserRole.PATIENT ? 'bg-primary-green text-white shadow-md' : 'text-gray-600 hover:bg-white'}">Patient</button>
        <button type="button" data-role="${UserRole.DOCTOR}" class="role-btn w-full py-2.5 text-sm font-semibold transition-colors duration-300 rounded-md ${currentRole === UserRole.DOCTOR ? 'bg-primary-green text-white shadow-md' : 'text-gray-600 hover:bg-white'}">Doctor</button>
        <button type="button" data-role="${UserRole.ADMIN}" class="role-btn w-full py-2.5 text-sm font-semibold transition-colors duration-300 rounded-md ${currentRole === UserRole.ADMIN ? 'bg-primary-green text-white shadow-md' : 'text-gray-600 hover:bg-white'}">Admin</button>
      </div>

      <div class="flex justify-center mb-6">
        <svg class="w-24 h-24" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#80CBC4;stop-opacity:1"></stop><stop offset="100%" style="stop-color:#4DB6AC;stop-opacity:1"></stop></linearGradient><clipPath id="avatarCircle"><circle cx="50" cy="50" r="48"></circle></clipPath></defs>
            <circle cx="50" cy="50" r="50" fill="url(#avatarGradient)"></circle>
            <g clip-path="url(#avatarCircle)"><circle cx="50" cy="40" r="20" fill="#FFCCBC"></circle><path d="M30,40 C35,20 65,20 70,40 C70,45 60,50 50,50 C40,50 30,45 30,40 Z" fill="#5D4037"></path><path d="M25,85 C25,70 75,70 75,85 L75,100 L25,100 Z" fill="#27C690"></path><path d="M50,85 L40,75 L60,75 Z" fill="#FFF"></path></g>
        </svg>
      </div>

      <form id="login-form" class="space-y-6">
        <div>
          <label for="loginId" class="block text-sm font-bold text-gray-700 mb-1">${isEmailLogin ? 'Email' : 'Health Id'}</label>
          <input id="loginId" name="loginId" type="${isEmailLogin ? 'email' : 'text'}" required class="block w-full px-4 py-3 bg-login-input-bg border-0 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green text-gray-900" placeholder="${isEmailLogin ? 'Your Email Address' : 'Your Health ID'}">
          <p class="error-message text-red-500 text-xs mt-1 ml-1"></p>
        </div>
        <div>
          <label for="password" class="block text-sm font-bold text-gray-700 mb-1">Password</label>
          <div class="relative">
             <input id="password" name="password" type="password" required class="block w-full px-4 py-3 bg-login-input-bg border-0 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green text-gray-900" placeholder="Your Password">
              <button type="button" id="show-password-btn" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700" aria-label="Show password">
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              </button>
          </div>
        </div>
        <div class="flex items-center justify-end">
            <button type="button" data-mode="${AuthMode.FORGOT_PASSWORD}" class="auth-mode-btn text-sm font-medium text-primary-green hover:underline focus:outline-none">Forgot Password?</button>
        </div>
        <div class="pt-2">
          <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-primary-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">Login</button>
        </div>
      </form>
       <div class="text-center mt-8">
            <a href="register.html" class="text-sm font-medium text-gray-600 hover:text-primary-green hover:underline focus:outline-none">New User, Register here</a>
       </div>
    </div>
    `;
}

function renderForgotPasswordPage() {
    return `
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl p-8 transition-all duration-500 border border-gray-200">
        ${renderForgotPasswordForm()}
      </div>
    </div>
    `;
}

function renderForgotPasswordForm() {
    let stepContent = '';
    if (forgotPasswordStep === 1) {
        stepContent = `
        <p class="text-center text-gray-500 text-sm">Enter your Health ID to begin the password reset process.</p>
        <div>
            <label for="userId" class="block text-sm font-medium text-gray-700">Health ID</label>
            <input id="userId" name="userId" type="text" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm text-gray-900" placeholder="your-health-id">
        </div>
        <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-primary-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:bg-gray-400 disabled:cursor-not-allowed">Continue</button>
        `;
    } else if (forgotPasswordStep === 2) {
        stepContent = `
        <p class="text-center text-gray-500 text-sm">Answer your security question to verify your identity.</p>
        <div>
            <label class="block text-sm font-medium text-gray-700">Security Question</label>
            <p class="mt-1 w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-gray-600">${forgotPasswordUser?.securityQuestion}</p>
        </div>
        <div>
            <label for="securityAnswer" class="block text-sm font-medium text-gray-700">Your Answer</label>
            <input id="securityAnswer" name="securityAnswer" type="text" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm text-gray-900">
        </div>
        <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-primary-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:bg-gray-400 disabled:cursor-not-allowed">Verify</button>
        `;
    } else {
        stepContent = `
        <p class="text-center text-gray-500 text-sm">Please enter a new, strong password.</p>
        <div>
            <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
            <input id="newPassword" name="newPassword" type="password" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm text-gray-900">
        </div>
        <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-green focus:border-primary-green sm:text-sm text-gray-900">
        </div>
        <button type="submit" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-green hover:bg-primary-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:bg-gray-400 disabled:cursor-not-allowed">Set New Password</button>
        `;
    }

    return `
    <div>
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">Reset Your Password</h2>
      <p class="error-message text-red-500 text-sm text-center mb-4"></p>
      <form id="forgot-password-form" class="space-y-6">
        ${stepContent}
      </form>
       <p class="mt-6 text-center text-sm text-gray-600">
        Remember your password? 
        <button data-mode="${AuthMode.LOGIN}" class="auth-mode-btn font-medium text-primary-green hover:underline">Sign in</button>
      </p>
    </div>
    `;
}

function renderRegisterForm() {
    const inputStyle = "block w-full px-3 py-2 bg-input-bg border-transparent rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-green sm:text-sm text-gray-900";
    const labelStyle = "block text-sm font-bold text-gray-800 mb-1";

    return `
    <div>
        <h1 class="text-4xl font-black text-center text-gray-800 mb-8">Register</h1>
        <div class="max-w-xs mx-auto bg-gray-100 rounded-lg p-1 grid grid-cols-2 gap-1 mb-8">
            <button type="button" data-type="patient" class="registration-type-btn bg-primary-green text-white shadow-md w-full py-2.5 text-sm font-semibold transition-colors duration-300 rounded-md">Patient</button>
            <button type="button" data-type="doctor" class="registration-type-btn bg-gray-100 text-gray-600 hover:bg-gray-200 w-full py-2.5 text-sm font-semibold transition-colors duration-300 rounded-md">Doctor</button>
        </div>
        
        <div id="patient-form-fields">
            <form id="register-form" class="space-y-6">
                <!-- Personal Details -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label class="${labelStyle}">Name</label><input type="text" name="firstName" placeholder="first name" class="${inputStyle}" required></div>
                    <div class="self-end"><input type="text" name="middleName" placeholder="middle name" class="${inputStyle}"></div>
                    <div class="self-end"><input type="text" name="lastName" placeholder="last name" class="${inputStyle}" required></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label class="${labelStyle}">Birthdate</label>
                        <div class="relative">
                            <input type="text" id="birthdate" name="birthdate" placeholder="dd-mm-yyyy" class="${inputStyle} pr-10" required>
                            <svg xmlns="http://www.w3.org/2000/svg" class="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                    </div>
                    <div><label class="${labelStyle}">Mobile No.</label><input type="tel" name="mobileNo" placeholder="mobile no." class="${inputStyle}" required></div>
                    <div><label class="${labelStyle}">Aadhar Card No.</label><input type="text" name="aadharNo" placeholder="Aadhar card No." class="${inputStyle}" required></div>
                    <div><label class="${labelStyle}">Email</label><input type="email" name="email" placeholder="e.g: abcdefg@gmail.com" class="${inputStyle}" required></div>
                    <div><label class="${labelStyle}">Blood Group</label><select name="bloodGroup" class="${inputStyle}"><option>select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div>
                </div>

                <!-- Address -->
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label class="${labelStyle}">Address</label><input type="text" name="address1" placeholder="building/area" class="${inputStyle}" required></div>
                        <div class="self-end"><input type="text" name="address2" placeholder="village/city" class="${inputStyle}" required></div>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <input type="text" name="landmark" placeholder="Landmark" class="${inputStyle}"><input type="text" name="district" placeholder="District" class="${inputStyle}" required><input type="text" name="pincode" placeholder="Pin-code" class="${inputStyle}"><input type="text" name="state" placeholder="State" class="${inputStyle}" required>
                    </div>
                </div>
                
                <!-- Password -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label class="${labelStyle}">Password</label><div class="relative"><input name="password" type="password" placeholder="password" class="${inputStyle}" required><button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button></div></div>
                    <div><label class="${labelStyle}">Confirm Password</label><div class="relative"><input name="confirmPassword" type="password" placeholder="Confirm password" class="${inputStyle}" required><button type="button" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"><svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg></button></div></div>
                </div>

                <!-- Security Question -->
                <div class="space-y-4 pt-4 border-t border-gray-200">
                    <h3 class="text-xl font-bold text-center text-gray-800">Password Recovery</h3>
                    <p class="text-sm text-center text-gray-500">Choose a security question. This will be used if you forget your password.</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label class="${labelStyle}">Security Question</label><select name="securityQuestion" class="${inputStyle}" required><option value="">Select a question...</option>${SECURITY_QUESTIONS.map(q => `<option value="${q}">${q}</option>`).join('')}</select></div>
                        <div><label class="${labelStyle}">Your Answer</label><input type="text" name="securityAnswer" placeholder="Your secret answer" class="${inputStyle}" required></div>
                    </div>
                </div>

                <!-- Permanent Disease -->
                <div>
                    <label class="${labelStyle}">Name of any permanent disease (if any)</label>
                    <div id="disease-container">
                        <div class="flex items-center gap-2 mb-2 disease-entry">
                            <input name="diseaseName" type="text" placeholder="eg.diabetes" class="${inputStyle}">
                            <input name="diseaseYears" type="text" placeholder="years e.g 3" class="${inputStyle} w-1/3">
                            <button type="button" class="remove-disease-btn p-2 rounded-full bg-red-100 text-red-600" disabled><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4"></path></svg></button>
                            <button type="button" id="add-disease-btn" class="p-2 rounded-full bg-green-100 text-green-600"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg></button>
                        </div>
                    </div>
                </div>

                <hr class="border-gray-300">
                
                <!-- Emergency Contact Details -->
                <div class="space-y-4">
                    <h3 class="text-xl font-bold text-center text-gray-800">Emergency Contact Details</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="${labelStyle}">Name</label><input type="text" name="emergencyFirstName" placeholder="first name" class="${inputStyle}"></div><div class="self-end"><input type="text" name="emergencyLastName" placeholder="last name" class="${inputStyle}"></div></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="${labelStyle}">Mobile No.</label><input type="tel" name="emergencyMobile" placeholder="mobile no." class="${inputStyle}"></div><div><label class="${labelStyle}">Email</label><input type="email" name="emergencyEmail" placeholder="email" class="${inputStyle}"></div></div>
                    <div><label class="${labelStyle}">Relation with patient</label><input type="text" name="emergencyRelation" placeholder="eg. father" class="${inputStyle}"></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="${labelStyle}">Address</label><input type="text" name="emergencyAddress1" placeholder="building/area" class="${inputStyle}"></div><div class="self-end"><input type="text" name="emergencyAddress2" placeholder="village/city" class="${inputStyle}"></div></div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"><input type="text" name="emergencyLandmark" placeholder="Landmark" class="${inputStyle}"><input type="text" name="emergencyDistrict" placeholder="District" class="${inputStyle}"><input type="text" name="emergencyPincode" placeholder="Pin-code" class="${inputStyle}"><input type="text" name="emergencyState" placeholder="State" class="${inputStyle}"></div>
                </div>

                <p class="error-message text-red-500 text-sm text-center font-semibold mt-2"></p>
                <div class="pt-4 flex justify-center">
                    <button type="submit" class="w-1/2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-green hover:bg-primary-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:bg-gray-400 disabled:cursor-not-allowed">Create Account</button>
                </div>
            </form>
        </div>
        
        <div id="doctor-info-fields" class="hidden text-center">
            <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">Doctor Registration</h2>
            <div class="bg-green-50 border-l-4 border-primary-green text-green-800 p-4 rounded-md mt-6" role="alert">
                <p class="font-bold">Manual Registration Required</p>
                <p class="text-sm mt-1">For security and verification, doctors cannot register directly. Please email your complete professional details to our administration team at <a href="mailto:${ADMIN_EMAIL}" class="font-medium underline">${ADMIN_EMAIL}</a> to have your account created.</p>
            </div>
        </div>

        <div class="text-center mt-8">
            <p class="text-sm text-gray-600">
                Already have an account? 
                <a href="index.html" class="font-medium text-primary-green hover:underline focus:outline-none">Login here</a>
            </p>
       </div>
    </div>
    `;
}

// Initial Render
document.addEventListener('DOMContentLoaded', render);