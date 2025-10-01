import React, { useState } from 'react';
import { AuthMode, User } from '../types';
import { ADMIN_EMAIL, SECURITY_QUESTIONS } from '../constants';
import EyeIcon from './icons/EyeIcon';
import CalendarIcon from './icons/CalendarIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import { registerUser } from '../services/db';

interface RegisterFormProps {
  setAuthMode: (mode: AuthMode) => void;
  onLoginSuccess: (user: User) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ setAuthMode, onLoginSuccess }) => {
  const [registrationType, setRegistrationType] = useState<'patient' | 'doctor'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [diseases, setDiseases] = useState([{ name: '', years: '' }]);
  const [birthdate, setBirthdate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDiseaseChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newDiseases = [...diseases];
    newDiseases[index] = { ...newDiseases[index], [e.target.name]: e.target.value };
    setDiseases(newDiseases);
  };
  
  const addDisease = () => setDiseases([...diseases, { name: '', years: '' }]);
  const removeDisease = (index: number) => setDiseases(diseases.filter((_, i) => i !== index));

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    const truncatedValue = rawValue.substring(0, 8); // Limit to 8 digits (ddmmyyyy)
    let formattedValue = truncatedValue;

    if (truncatedValue.length > 2) {
      formattedValue = `${truncatedValue.substring(0, 2)}-${truncatedValue.substring(2)}`;
    }
    if (truncatedValue.length > 4) {
      formattedValue = `${formattedValue.substring(0, 5)}-${formattedValue.substring(5)}`;
    }
    setBirthdate(formattedValue);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const middleName = formData.get('middleName') as string;
    const mobileNo = formData.get('mobileNo') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!firstName || !lastName || !mobileNo || !password) {
        setError('Please fill all required fields.');
        return;
    }

    if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
    }
    setIsLoading(true);

    const randomSuffix = String(Math.floor(Math.random() * 900) + 100);
    const healthId = `HID${mobileNo.slice(-4)}${randomSuffix}`;

    const nameParts = [firstName, middleName, lastName].filter(Boolean);

    const emergencyFirstName = formData.get('emergencyFirstName') as string;
    const emergencyMobile = formData.get('emergencyMobile') as string;

    let emergencyContact: User['emergencyContact'];
    if (emergencyFirstName && emergencyMobile) {
        emergencyContact = {
            name: `${emergencyFirstName} ${formData.get('emergencyLastName') as string}`,
            mobile: emergencyMobile,
            email: formData.get('emergencyEmail') as string,
            relation: formData.get('emergencyRelation') as string,
            address: {
                address1: formData.get('emergencyAddress1') as string,
                address2: formData.get('emergencyAddress2') as string,
                landmark: formData.get('emergencyLandmark') as string,
                district: formData.get('emergencyDistrict') as string,
                pincode: formData.get('emergencyPincode') as string,
                state: formData.get('emergencyState') as string,
            }
        };
    }

    const newUser: User = {
        healthId,
        name: nameParts.join(' '),
        mobileNo,
        password,
        email: formData.get('email') as string,
        birthdate: formData.get('birthdate') as string,
        aadharNo: formData.get('aadharNo') as string,
        bloodGroup: formData.get('bloodGroup') as string,
        address: {
            address1: formData.get('address1') as string,
            address2: formData.get('address2') as string,
            landmark: formData.get('landmark') as string,
            district: formData.get('district') as string,
            pincode: formData.get('pincode') as string,
            state: formData.get('state') as string,
        },
        securityQuestion: formData.get('securityQuestion') as string,
        securityAnswer: (formData.get('securityAnswer') as string).toLowerCase(),
        permanentDiseases: diseases.filter(d => d.name.trim() !== ''),
        emergencyContact,
    };

    try {
        const registeredUser = await registerUser(newUser);
        alert(`Registration successful! Your new Health ID is: ${healthId}.\nYou will now be logged in.`);
        onLoginSuccess(registeredUser);
    } catch(err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const inputStyle = "block w-full px-3 py-2 bg-input-bg dark:bg-dark-bg dark:border dark:border-dark-subtext/20 border-transparent rounded-md placeholder-gray-500 dark:placeholder-dark-placeholder sm:text-sm text-gray-900 dark:text-dark-text";
  const labelStyle = "block text-sm font-bold text-gray-800 dark:text-dark-text mb-1";
  
  // FIX: Switched to React.FC to explicitly define a component with children, resolving a TypeScript error.
  const RoleButton: React.FC<{ value: 'patient' | 'doctor'; children: React.ReactNode; }> = ({ value, children }) => (
    <button
      type="button"
      onClick={() => setRegistrationType(value)}
      className={`w-full py-2.5 text-sm font-semibold transition-colors duration-300 rounded-md ${
        registrationType === value
          ? 'bg-primary-green text-white shadow-md'
          : 'bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-subtext hover:bg-gray-200 dark:hover:bg-dark-card'
      }`}
    >
      {children}
    </button>
  );

  const renderPatientForm = () => (
    <form onSubmit={handleRegister} className="space-y-6">
      <fieldset disabled={isLoading} className="space-y-6">
      {/* --- Personal Details --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelStyle}>Name</label>
          <input type="text" name="firstName" placeholder="first name" className={inputStyle} required/>
        </div>
        <div className="self-end">
          <input type="text" name="middleName" placeholder="middle name" className={inputStyle} />
        </div>
        <div className="self-end">
          <input type="text" name="lastName" placeholder="last name" className={inputStyle} required/>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
            <label className={labelStyle}>Birthdate</label>
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="dd-mm-yyyy" 
                    className={`${inputStyle} pr-10`} 
                    required
                    value={birthdate}
                    onChange={handleBirthdateChange}
                    name="birthdate"
                />
                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
        </div>
        <div>
          <label className={labelStyle}>Mobile No.</label>
          <input type="tel" name="mobileNo" placeholder="mobile no." className={inputStyle} required/>
        </div>
        <div>
          <label className={labelStyle}>Aadhar Card No.</label>
          <input type="text" name="aadharNo" placeholder="Aadhar card No." className={inputStyle} required/>
        </div>
         <div>
          <label className={labelStyle}>Email</label>
          <input type="email" name="email" placeholder="e.g: abcdefg@gmail.com" className={inputStyle} required/>
        </div>
        <div>
            <label className={labelStyle}>Blood Group</label>
            <select name="bloodGroup" className={inputStyle}>
                <option>select</option>
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>AB+</option><option>AB-</option>
                <option>O+</option><option>O-</option>
            </select>
        </div>
      </div>

      {/* --- Address --- */}
      <div className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={labelStyle}>Address</label>
                <input type="text" name="address1" placeholder="building/area" className={inputStyle} required/>
            </div>
            <div className="self-end">
                 <input type="text" name="address2" placeholder="village/city" className={inputStyle} required/>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <input type="text" name="landmark" placeholder="Landmark" className={inputStyle} />
             <input type="text" name="district" placeholder="District" className={inputStyle} required/>
             <input type="text" name="pincode" placeholder="Pin-code" className={inputStyle} />
             <input type="text" name="state" placeholder="State" className={inputStyle} required/>
         </div>
      </div>
      
      {/* --- Password --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
              <label className={labelStyle}>Password</label>
              <div className="relative">
                  <input name="password" type={showPassword ? 'text' : 'password'} placeholder="password" className={inputStyle} required/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-dark-subtext">
                      <EyeIcon className="h-5 w-5" />
                  </button>
              </div>
          </div>
          <div>
              <label className={labelStyle}>Confirm Password</label>
               <div className="relative">
                  <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" className={inputStyle} required/>
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-dark-subtext">
                      <EyeIcon className="h-5 w-5" />
                  </button>
              </div>
          </div>
      </div>

      {/* --- Security Question --- */}
      <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-dark-subtext/20">
          <h3 className="text-xl font-bold text-center text-gray-800 dark:text-dark-text">Password Recovery</h3>
          <p className="text-sm text-center text-gray-500 dark:text-dark-subtext">Choose a security question. This will be used if you forget your password.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className={labelStyle}>Security Question</label>
                  <select name="securityQuestion" className={inputStyle} required>
                      <option value="">Select a question...</option>
                      {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
              </div>
              <div>
                  <label className={labelStyle}>Your Answer</label>
                  <input type="text" name="securityAnswer" placeholder="Your secret answer" className={inputStyle} required/>
              </div>
          </div>
      </div>

      {/* --- Permanent Disease --- */}
      <div>
        <label className={labelStyle}>Name of any permanent disease (if any)</label>
        {diseases.map((disease, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <input name="name" type="text" placeholder="eg.diabetes" value={disease.name} onChange={(e) => handleDiseaseChange(index, e)} className={inputStyle} />
            <input name="years" type="text" placeholder="years e.g 3" value={disease.years} onChange={(e) => handleDiseaseChange(index, e)} className={`${inputStyle} w-1/3`} />
            <button type="button" onClick={() => removeDisease(index)} disabled={diseases.length === 1} className="p-2 rounded-full bg-red-100 text-red-600 disabled:bg-gray-100 disabled:text-gray-400"><MinusIcon className="w-5 h-5"/></button>
            <button type="button" onClick={addDisease} className="p-2 rounded-full bg-green-100 text-green-600"><PlusIcon className="w-5 h-5" /></button>
          </div>
        ))}
      </div>

      <hr className="border-gray-300 dark:border-dark-subtext/20" />
      
      {/* --- Emergency Contact Details --- */}
      <div className="space-y-4">
          <h3 className="text-xl font-bold text-center text-gray-800 dark:text-dark-text">Emergency Contact Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className={labelStyle}>Name</label>
                  <input type="text" name="emergencyFirstName" placeholder="first name" className={inputStyle} />
              </div>
              <div className="self-end">
                  <input type="text" name="emergencyLastName" placeholder="last name" className={inputStyle} />
              </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className={labelStyle}>Mobile No.</label>
                  <input type="tel" name="emergencyMobile" placeholder="mobile no." className={inputStyle} />
              </div>
              <div>
                  <label className={labelStyle}>Email</label>
                  <input type="email" name="emergencyEmail" placeholder="email" className={inputStyle} />
              </div>
          </div>
           <div>
                <label className={labelStyle}>Relation with patient</label>
                <input type="text" name="emergencyRelation" placeholder="eg. father" className={inputStyle} />
            </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={labelStyle}>Address</label>
                <input type="text" name="emergencyAddress1" placeholder="building/area" className={inputStyle} />
            </div>
            <div className="self-end">
                 <input type="text" name="emergencyAddress2" placeholder="village/city" className={inputStyle} />
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <input type="text" name="emergencyLandmark" placeholder="Landmark" className={inputStyle} />
             <input type="text" name="emergencyDistrict" placeholder="District" className={inputStyle} />
             <input type="text" name="emergencyPincode" placeholder="Pin-code" className={inputStyle} />
             <input type="text" name="emergencyState" placeholder="State" className={inputStyle} />
         </div>
      </div>
      </fieldset>

      {error && <p className="text-red-500 dark:text-red-400 text-sm text-center font-semibold mt-2">{error}</p>}

      <div className="pt-4 flex justify-center">
          <button type="submit" disabled={isLoading} className="w-1/2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-green hover:bg-primary-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:bg-gray-400 disabled:cursor-not-allowed">
             {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
      </div>
    </form>
  );

  const renderDoctorInfo = () => (
     <div className="text-center">
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-dark-text mb-2">Doctor Registration</h2>
         <div className="bg-green-50 dark:bg-dark-accent/10 border-l-4 border-primary-green dark:border-dark-accent text-green-800 dark:text-dark-accent/80 p-4 rounded-md mt-6" role="alert">
            <p className="font-bold">Manual Registration Required</p>
            <p className="text-sm mt-1">For security and verification, doctors cannot register directly. Please email your complete professional details to our administration team at <a href={`mailto:${ADMIN_EMAIL}`} className="font-medium underline dark:text-dark-accent">{ADMIN_EMAIL}</a> to have your account created.</p>
          </div>
      </div>
  );

  return (
    <div>
        <h1 className="text-4xl font-black text-center text-gray-800 dark:text-dark-text mb-8">Register</h1>
        <div className="max-w-xs mx-auto bg-gray-100 dark:bg-dark-bg/80 rounded-lg p-1 grid grid-cols-2 gap-1 mb-8">
            <RoleButton value="patient">Patient</RoleButton>
            <RoleButton value="doctor">Doctor</RoleButton>
        </div>
        
        {registrationType === 'patient' ? renderPatientForm() : renderDoctorInfo()}

        <div className="text-center mt-8">
            <p className="text-sm text-gray-600 dark:text-dark-subtext">
                Already have an account?{' '}
                <button
                    onClick={() => setAuthMode(AuthMode.LOGIN)}
                    className="font-medium text-primary-green dark:text-dark-accent hover:underline focus:outline-none"
                >
                    Login here
                </button>
            </p>
       </div>
    </div>
  );
};

export default RegisterForm;