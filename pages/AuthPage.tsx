import React from 'react';
import { AuthMode, User } from '../types';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

interface AuthPageProps {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  onLoginSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ authMode, setAuthMode, onLoginSuccess }) => {

  const renderForm = () => {
    switch (authMode) {
      case AuthMode.REGISTER:
        return <RegisterForm setAuthMode={setAuthMode} onLoginSuccess={onLoginSuccess} />;
      case AuthMode.FORGOT_PASSWORD:
        return <ForgotPasswordForm setAuthMode={setAuthMode} />;
      case AuthMode.LOGIN:
      default:
        return <LoginForm setAuthMode={setAuthMode} onLoginSuccess={onLoginSuccess} />;
    }
  };

  return (
    <div className={`w-full px-4 ${authMode === AuthMode.REGISTER ? 'max-w-5xl' : 'max-w-md'} transition-all duration-500`}>
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 transition-all duration-500 border border-gray-200 dark:border-dark-subtext/20">
            {renderForm()}
        </div>
    </div>
  );
};

export default AuthPage;
