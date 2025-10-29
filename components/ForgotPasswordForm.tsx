import React, { useState } from 'react';
import { AuthMode, User, UserRole } from '../types';
import { getUserById, updateUser, requestPasswordResetOtp, resetPasswordWithOtp } from '../services/db';

interface ForgotPasswordFormProps {
  setAuthMode: (mode: AuthMode) => void;
  setSelectedRole?: (role: UserRole) => void;
  selectedRole?: UserRole;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ setAuthMode, setSelectedRole, selectedRole }) => {
  const [role, setRole] = useState<UserRole>(selectedRole || UserRole.PATIENT);
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState(''); // Can be Health ID or Email
  const [user, setUser] = useState<User | null>(null);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // --- Patient Flow Handlers ---
  const handlePatientStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        const foundUser = await getUserById(identifier.trim());
        if (foundUser && foundUser.securityQuestion) {
          setUser(foundUser);
          setStep(2);
        } else {
          setError("Health ID not found or no security question is set for this account.");
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const handlePatientStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (user && securityAnswer.trim().toLowerCase() === user.securityAnswer) {
      setStep(3);
    } else {
      setError("The answer is incorrect. Please try again.");
    }
  };

  const handlePatientStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    if (user) {
        setIsLoading(true);
        try {
            await updateUser(user.healthId, { password: newPassword });
            alert("Password has been reset successfully. Please log in.");
            if (setSelectedRole) setSelectedRole(UserRole.PATIENT);
            setAuthMode(AuthMode.LOGIN);
        } catch(err) {
            setError(err instanceof Error ? err.message : "An error occurred updating your password.");
            setStep(1);
        } finally {
            setIsLoading(false);
        }
    }
  };

  // --- Admin/Doctor Flow Handlers ---
  const handleAdminDoctorStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
        await requestPasswordResetOtp(identifier.trim(), role);
        setSuccessMessage(`An OTP has been sent to ${identifier.trim()}. Please check your inbox.`);
        setStep(2);
    } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleAdminDoctorStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setIsLoading(true);
    try {
        await resetPasswordWithOtp(identifier.trim(), otp, newPassword);
        alert("Password has been reset successfully. Please log in.");
        
        // Navigate based on role
        if (role === UserRole.ADMIN) {
            // Redirect to admin portal
            window.location.href = '/admin-portal';
        } else {
            // For Doctor, set the role and go to main login
            if (setSelectedRole) setSelectedRole(role);
            setAuthMode(AuthMode.LOGIN);
        }
    } catch(err) {
        setError(err instanceof Error ? err.message : "Invalid OTP or an error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  // FIX: Added `children: React.ReactNode` to the props type for RoleButton. 
  // In newer versions of React types, React.FC no longer implicitly includes children.
  const RoleButton: React.FC<{ value: UserRole; children: React.ReactNode; }> = ({ value, children }) => (
    <button
      type="button"
      onClick={() => {
        setRole(value);
        setError('');
        setSuccessMessage('');
        setIdentifier('');
        setStep(1);
      }}
      className={`w-full py-2.5 text-sm font-semibold transition-colors duration-300 rounded-md ${
        role === value
          ? 'bg-primary-green dark:bg-dark-accent text-white dark:text-dark-bg shadow-md'
          : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-subtext hover:bg-white dark:hover:bg-dark-card'
      }`}
    >
      {children}
    </button>
  );
  
  const primaryButton = "w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent hover:bg-primary-green-dark dark:hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green dark:focus:ring-dark-accent disabled:bg-gray-400 disabled:cursor-not-allowed";
  const inputStyle = "mt-1 block w-full px-3 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-subtext/40 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-primary-green dark:focus:ring-dark-accent focus:border-primary-green dark:focus:border-dark-accent sm:text-sm text-gray-900 dark:text-dark-text";
  
  const renderPatientFlow = () => (
    <>
      {step === 1 && (
        <form onSubmit={handlePatientStep1} className="space-y-6">
          <p className="text-center text-gray-500 dark:text-dark-subtext text-sm">Enter your Health ID to begin the password reset process.</p>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Health ID</label>
            <input id="userId" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className={inputStyle} placeholder="your-health-id" disabled={isLoading}/>
          </div>
          <button type="submit" className={primaryButton} disabled={isLoading}>{isLoading ? 'Searching...' : 'Continue'}</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handlePatientStep2} className="space-y-6">
            <p className="text-center text-gray-500 dark:text-dark-subtext text-sm">Answer your security question to verify your identity.</p>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Security Question</label>
                <p className="mt-1 w-full px-3 py-2 bg-gray-100 dark:bg-dark-bg border border-gray-200 dark:border-dark-subtext/30 rounded-md text-gray-600 dark:text-dark-subtext">{user?.securityQuestion}</p>
            </div>
            <div>
                <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Your Answer</label>
                <input id="securityAnswer" type="text" value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} required className={inputStyle}/>
            </div>
            <button type="submit" className={primaryButton}>Verify</button>
        </form>
      )}
      {step === 3 && (
        <form onSubmit={handlePatientStep3} className="space-y-6">
            <p className="text-center text-gray-500 dark:text-dark-subtext text-sm">Please enter a new, strong password.</p>
            <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">New Password</label>
                <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputStyle} disabled={isLoading}/>
            </div>
             <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Confirm New Password</label>
                <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputStyle} disabled={isLoading}/>
            </div>
            <button type="submit" className={primaryButton} disabled={isLoading}>{isLoading ? 'Saving...' : 'Set New Password'}</button>
        </form>
      )}
    </>
  );

  const renderAdminDoctorFlow = () => (
    <>
        {step === 1 && (
            <form onSubmit={handleAdminDoctorStep1} className="space-y-6">
                <p className="text-center text-gray-500 dark:text-dark-subtext text-sm">Enter your registered email address to receive a password reset code.</p>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Email Address</label>
                    <input id="email" type="email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className={inputStyle} placeholder="your.email@example.com" disabled={isLoading} />
                </div>
                <button type="submit" className={primaryButton} disabled={isLoading}>{isLoading ? 'Sending...' : 'Send Reset Code'}</button>
            </form>
        )}
        {step === 2 && (
            <form onSubmit={handleAdminDoctorStep2} className="space-y-6">
                <p className="text-center text-gray-500 dark:text-dark-subtext text-sm">Enter the 6-digit code sent to your email and set a new password.</p>
                 <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Reset Code (OTP)</label>
                    <input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className={inputStyle} disabled={isLoading} maxLength={6} placeholder="######" />
                </div>
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">New Password</label>
                    <input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputStyle} disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-dark-subtext">Confirm New Password</label>
                    <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputStyle} disabled={isLoading}/>
                </div>
                <button type="submit" className={primaryButton} disabled={isLoading}>{isLoading ? 'Resetting...' : 'Reset Password'}</button>
            </form>
        )}
    </>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-dark-text mb-6">Reset Your Password</h2>

      <div className="bg-role-switcher-bg dark:bg-dark-bg rounded-lg p-1 grid grid-cols-2 gap-1 mb-6">
        <RoleButton value={UserRole.PATIENT}>Patient</RoleButton>
        <RoleButton value={UserRole.DOCTOR}>Doctor</RoleButton>
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-sm text-center mb-4">{error}</p>}
      {successMessage && !error && <p className="text-green-600 dark:text-green-400 text-sm text-center mb-4">{successMessage}</p>}
      
      {role === UserRole.PATIENT ? renderPatientFlow() : renderAdminDoctorFlow()}

       <p className="mt-6 text-center text-sm text-gray-600 dark:text-dark-subtext">
        Remember your password?{' '}
        <button onClick={() => setAuthMode(AuthMode.LOGIN)} className="font-medium text-primary-green dark:text-dark-accent hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
