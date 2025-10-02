import React from 'react';
import AuthPage from './AuthPage';
import { AuthMode, User } from '../types';
import Illustration from '../components/icons/Illustration';

interface HomePageProps {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  onLoginSuccess: (user: User) => void;
  theme: 'light' | 'dark';
}

const HomePage: React.FC<HomePageProps> = ({ authMode, setAuthMode, onLoginSuccess, theme }) => {
  if (authMode === AuthMode.REGISTER) {
    return (
      <main className="container mx-auto flex-grow flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full flex justify-center">
            <AuthPage authMode={authMode} setAuthMode={setAuthMode} onLoginSuccess={onLoginSuccess} />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto flex-grow flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="hidden md:flex justify-center">
          <Illustration className="w-full max-w-lg h-auto" theme={theme} />
        </div>
        <div className="flex justify-center md:justify-end">
          <AuthPage authMode={authMode} setAuthMode={setAuthMode} onLoginSuccess={onLoginSuccess} />
        </div>
      </div>
    </main>
  );
};

export default HomePage;