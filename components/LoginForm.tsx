import React, { useState } from 'react';
import { UserRole, AuthMode, User } from '../types';
import UserAvatarIcon from './icons/UserAvatarIcon';
import EyeIcon from './icons/EyeIcon';
import { authenticateUser, authenticateAdmin } from '../services/db';

interface LoginFormProps {
  setAuthMode: (mode: AuthMode) => void;
  onLoginSuccess: (user: User) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ setAuthMode, onLoginSuccess }) => {
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let user: User;
      if (role === UserRole.ADMIN) {
        user = await authenticateAdmin(userId.trim(), password);
      } else {
        // Patients and Doctors use the same authentication function
        user = await authenticateUser(userId.trim(), password);
        // But we must verify the role matches
        if (user.role !== role) {
            throw new Error(`You are not registered as a ${role}.`);
        }
      }
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailLogin = role === UserRole.ADMIN || role === UserRole.DOCTOR;

  // FIX: Switched to React.FC to explicitly define a component with children, resolving a TypeScript error.
  const RoleButton: React.FC<{ value: UserRole, children: React.ReactNode }> = ({ value, children }) => (
    <button
      type="button"
      onClick={() => {
        setRole(value);
        setError('');
        setUserId('');
        setPassword('');
      }}
      className={`w-full py-2.5 text-sm font-semibold transition-colors duration-300 rounded-md ${
        role === value
          ? 'bg-primary-green dark:bg-dark-accent text-white dark:text-dark-bg shadow-md'
          : 'text-gray-600 dark:text-dark-subtext hover:bg-white dark:hover:bg-dark-card'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-primary-green dark:text-dark-accent mb-6">Login</h2>
      
      <div className="bg-role-switcher-bg dark:bg-dark-bg rounded-lg p-1 grid grid-cols-3 gap-1 mb-6">
        <RoleButton value={UserRole.PATIENT}>Patient</RoleButton>
        <RoleButton value={UserRole.DOCTOR}>Doctor</RoleButton>
        <RoleButton value={UserRole.ADMIN}>Admin</RoleButton>
      </div>

      <div className="flex justify-center mb-6">
        <UserAvatarIcon className="w-24 h-24" />
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label htmlFor="loginId" className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-1">
            {isEmailLogin ? 'Email' : 'Health Id'}
          </label>
          <input
            id="loginId"
            type={isEmailLogin ? 'email' : 'text'}
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setError('');
            }}
            required
            className="block w-full px-4 py-3 bg-login-input-bg dark:bg-dark-bg border-0 dark:border dark:border-dark-subtext/30 rounded-lg placeholder-gray-500 dark:placeholder-dark-placeholder focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent text-gray-900 dark:text-dark-text"
            disabled={isLoading}
            placeholder={isEmailLogin ? 'Your Email Address' : 'Your Health ID'}
          />
          {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">{error}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-1">Password</label>
          <div className="relative">
             <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-4 py-3 bg-login-input-bg dark:bg-dark-bg border-0 dark:border dark:border-dark-subtext/30 rounded-lg placeholder-gray-500 dark:placeholder-dark-placeholder focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent text-gray-900 dark:text-dark-text"
                disabled={isLoading}
                placeholder={'Your Password'}
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

        <div className="flex items-center justify-end">
            <button
                type="button"
                onClick={() => setAuthMode(AuthMode.FORGOT_PASSWORD)}
                className="text-sm font-medium text-primary-green dark:text-dark-accent hover:underline focus:outline-none"
            >
                Forgot Password?
            </button>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent hover:bg-primary-green-dark dark:hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green dark:focus:ring-dark-accent disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </>
            ) : (
                'Login'
            )}
          </button>
        </div>
      </form>
       <div className="text-center mt-8">
            <button
                onClick={() => setAuthMode(AuthMode.REGISTER)}
                className="text-sm font-medium text-gray-600 dark:text-dark-subtext hover:text-primary-green dark:hover:text-dark-accent hover:underline focus:outline-none"
            >
                New User, Register here
            </button>
       </div>
    </div>
  );
};

export default LoginForm;