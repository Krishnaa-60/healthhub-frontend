import React, { useState } from 'react';
import { UserRole } from '../types';
import { requestPasswordResetOtp, resetPasswordWithOtp } from '../services/db';

const AdminForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      await requestPasswordResetOtp(email.trim(), UserRole.ADMIN);
      setSuccessMessage(`A 6-digit reset code has been sent to ${email.trim()}. Please check your inbox.`);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset Password with OTP
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    setIsLoading(true);
    try {
      await resetPasswordWithOtp(email.trim(), otp, newPassword);
      alert('Password has been reset successfully! You can now log in with your new password.');
      window.location.href = '/admin-portal';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid reset code or an error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const primaryButton = "w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent hover:bg-primary-green-dark dark:hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green dark:focus:ring-dark-accent disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors";
  const inputStyle = "block w-full px-4 py-3 text-base bg-login-input-bg dark:bg-dark-bg border-0 dark:border dark:border-dark-subtext/30 rounded-lg placeholder-gray-500 dark:placeholder-dark-placeholder focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent text-gray-900 dark:text-dark-text";

  return (
    <div className="min-h-screen bg-light-gray-bg dark:bg-dark-bg flex flex-col">
      {/* Header */}
      <header className="w-full bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-dark-subtext/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
          <div className="flex items-center space-x-3">
            <img src="/assets/toplogo.png" alt="Healthhub Logo" className="h-8 w-8 sm:h-10 sm:w-10" />
            <h1 className="text-xl sm:text-2xl font-bold text-primary-green dark:text-dark-accent">
              Healthhub
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg p-6 sm:p-8">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-primary-green dark:text-dark-accent mb-2">
              Reset Admin Password
            </h2>
            <p className="text-center text-sm text-gray-600 dark:text-dark-subtext mb-6">
              Secure Password Recovery
            </p>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
            {successMessage && !error && (
              <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <p className="text-green-600 dark:text-green-400 text-sm text-center">{successMessage}</p>
              </div>
            )}

            {/* Step 1: Request OTP */}
            {step === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <p className="text-center text-sm text-gray-600 dark:text-dark-subtext">
                  Enter your registered admin email address to receive a password reset code.
                </p>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-2">
                    Admin Email Address
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
                    className={inputStyle}
                    placeholder="admin@healthhub.com"
                    disabled={isLoading}
                  />
                </div>

                <button type="submit" className={primaryButton} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending Code...
                    </>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Enter OTP and New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <p className="text-center text-sm text-gray-600 dark:text-dark-subtext">
                  Enter the 6-digit code sent to your email and set a new password.
                </p>

                <div>
                  <label htmlFor="otp" className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-2">
                    Reset Code (OTP)
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setError('');
                    }}
                    required
                    className={inputStyle}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className={inputStyle}
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-2">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className={inputStyle}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                </div>

                <button type="submit" className={primaryButton} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-sm text-gray-600 dark:text-dark-subtext hover:text-primary-green dark:hover:text-dark-accent"
                  >
                    ← Didn't receive code? Resend
                  </button>
                </div>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-dark-subtext/20 text-center">
              <p className="text-sm text-gray-600 dark:text-dark-subtext">
                Remember your password?{' '}
                <a href="/admin-portal" className="font-medium text-primary-green dark:text-dark-accent hover:underline">
                  Back to Admin Login
                </a>
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

export default AdminForgotPassword;
