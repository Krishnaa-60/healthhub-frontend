import React, { useState } from 'react';
import { User } from '../types';
import UserAvatarIcon from '../components/icons/UserAvatarIcon';
import EyeIcon from '../components/icons/EyeIcon';
import { authenticateAdmin } from '../services/db';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, theme, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await authenticateAdmin(email.trim(), password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light-gray-bg dark:bg-dark-bg flex flex-col">
      {/* Header with Theme Toggle */}
      <header className="w-full bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-dark-subtext/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/assets/toplogo.png" alt="Healthhub Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary-green dark:text-dark-accent">
              Healthhub
            </h1>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Admin Login Form */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 sm:p-8">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-green dark:text-dark-accent mb-2">
              Admin Portal
            </h2>
            <p className="text-center text-sm text-gray-600 dark:text-dark-subtext mb-6">
              Secure Administrator Access
            </p>

            {/* Avatar Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-primary-green/10 dark:bg-dark-accent/10 rounded-full">
                <UserAvatarIcon className="w-16 h-16 sm:w-20 sm:h-20" />
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-2">
                  Admin Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  className="block w-full px-4 py-3 text-base bg-login-input-bg dark:bg-dark-bg border-0 dark:border dark:border-dark-subtext/30 rounded-lg placeholder-gray-500 dark:placeholder-dark-placeholder focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent text-gray-900 dark:text-dark-text"
                  disabled={isLoading}
                  placeholder="admin@healthhub.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className="block w-full px-4 py-3 text-base bg-login-input-bg dark:bg-dark-bg border-0 dark:border dark:border-dark-subtext/30 rounded-lg placeholder-gray-500 dark:placeholder-dark-placeholder focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent text-gray-900 dark:text-dark-text"
                    disabled={isLoading}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 dark:text-dark-subtext hover:text-gray-700 dark:hover:text-dark-text"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => window.location.href = '/admin-forgot-password'}
                  className="text-sm font-medium text-primary-green dark:text-dark-accent hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent hover:bg-primary-green-dark dark:hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green dark:focus:ring-dark-accent disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  'Sign In as Administrator'
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-subtext/20">
              <p className="text-xs text-center text-gray-500 dark:text-dark-subtext">
                🔒 This is a secure administrator portal. All login attempts are monitored.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-white dark:bg-dark-card p-2 text-center text-sm text-gray-800 dark:text-dark-text font-semibold border-t border-gray-200 dark:border-dark-subtext/20">
        Developed by Team 9
      </footer>
    </div>
  );
};

export default AdminLogin;
