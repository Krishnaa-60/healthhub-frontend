import React, { useState, useEffect } from 'react';
import { User, UserRole, AuthMode, AppView } from './types';
import { getUserById } from './services/db';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AdminLogin from './pages/AdminLogin';

const App: React.FC = () => {
    const [isSplashing, setIsSplashing] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [view, setView] = useState<AppView>(() => {
        // Check if URL contains admin-portal path
        if (typeof window !== 'undefined' && window.location.pathname === '/admin-portal') {
            return 'admin-portal';
        }
        return 'auth';
    });
    const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.LOGIN);
    const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            // Use stored theme if it exists, otherwise default to 'light'
            return window.localStorage.getItem('theme') || 'light';
        }
        return 'light'; // Default to light for SSR or other environments
    });

    // Effect for splash screen
    useEffect(() => {
        const hideTimer = setTimeout(() => {
            setIsSplashing(false); 
        }, 1500); // Match animation duration

        return () => {
            clearTimeout(hideTimer);
        };
    }, []);

    // Effect to apply theme class and save to localStorage
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // Check for logged in user on initial load
    useEffect(() => {
        const checkLoggedInUser = async () => {
            const storedHealthId = sessionStorage.getItem('loggedInUser');
            if (storedHealthId) {
                try {
                    const fetchedUser = await getUserById(storedHealthId);
                    setUser(fetchedUser);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    sessionStorage.removeItem('loggedInUser');
                }
            }
        };
        // Run this check only after splash screen is gone
        if (!isSplashing) {
            checkLoggedInUser().finally(() => setIsLoading(false));
        }
    }, [isSplashing]);

    // Handle back button - prevent app from closing when user is logged in
    useEffect(() => {
        if (!user) return;

        // Push initial state when user logs in
        window.history.pushState({ appState: 'dashboard' }, '', window.location.href);

        const handlePopState = (event: PopStateEvent) => {
            // Prevent going back to login/previous pages
            event.preventDefault();
            window.history.pushState({ appState: 'dashboard' }, '', window.location.href);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [user]);

    const handleLoginSuccess = (loggedInUser: User) => {
        sessionStorage.setItem('loggedInUser', loggedInUser.healthId);
        setUser(loggedInUser);
        // Push a new state so back button works properly
        window.history.pushState({ appState: 'dashboard' }, '', window.location.href);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('loggedInUser');
        setUser(null);
        setView('auth');
        setAuthMode(AuthMode.LOGIN);
        // Clear history state
        window.history.replaceState(null, '', window.location.href);
    };
    
    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
    }

    if (isSplashing) {
        return (
            <div 
                className="w-screen h-screen bg-black flex items-center justify-center splash-animation"
                aria-label="Healthhub Loading Animation"
            >
                <img 
                    src="/assets/animation.png" 
                    alt="Healthhub Logo Splash"
                    className="w-[90%] h-[90%] object-contain"
                    role="img"
                />
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-light-gray-bg dark:bg-dark-bg">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-green dark:border-dark-accent"></div>
            </div>
        );
    }

    if (user) {
        switch (user.role) {
            case UserRole.ADMIN:
                return <AdminDashboard admin={user} onLogout={handleLogout} />;
            case UserRole.DOCTOR:
                return <DoctorDashboard doctor={user} onLogout={handleLogout} />;
            case UserRole.PATIENT:
            default:
                return <PatientDashboard user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
        }
    }

    // Render public pages if no user is logged in
    const renderPublicView = () => {
        switch (view) {
            case 'about':
                return <AboutPage />;
            case 'contact':
                return <ContactPage />;
            case 'admin-portal':
                return <AdminLogin onLoginSuccess={handleLoginSuccess} theme={theme as 'light' | 'dark'} toggleTheme={toggleTheme} />;
            case 'auth':
            default:
                return <HomePage authMode={authMode} setAuthMode={setAuthMode} onLoginSuccess={handleLoginSuccess} theme={theme as 'light' | 'dark'} selectedRole={selectedRole} setSelectedRole={setSelectedRole} />;
        }
    };
    
    // If viewing admin portal, render without header/footer
    if (view === 'admin-portal') {
        return renderPublicView();
    }

    return (
        <div className="bg-light-gray-bg dark:bg-dark-bg min-h-screen flex flex-col">
            <Header setAuthMode={setAuthMode} setView={setView} theme={theme} toggleTheme={toggleTheme} />
            <div className="flex-grow flex">
              {renderPublicView()}
            </div>
            <footer className="w-full bg-white dark:bg-dark-card p-2 text-center text-sm text-gray-800 dark:text-dark-text font-semibold border-t border-gray-200 dark:border-dark-subtext/20">
              Developed by Team 9
            </footer>
        </div>
    );
};

export default App;