import React, { useState, useEffect } from 'react';
import { Appointment } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface DoctorAppointmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: Omit<Appointment, 'id'>) => void;
    appointmentToEdit?: Appointment | null;
    isLoading: boolean;
}

const DoctorAppointmentForm: React.FC<DoctorAppointmentFormProps> = ({ isOpen, onClose, onSave, appointmentToEdit, isLoading }) => {
    const [formData, setFormData] = useState({
        patientName: '',
        patientMobile: '',
        patientEmail: '',
        date: '',
        time: '',
    });
    const [error, setError] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

    // Convert 24-hour time to 12-hour format
    const convertTo12Hour = (time24: string) => {
        if (!time24) return { time12: '', ampm: 'AM' as 'AM' | 'PM' };
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return { time12: `${h12.toString().padStart(2, '0')}:${minutes}`, ampm };
    };

    // Convert 12-hour time to 24-hour format
    const convertTo24Hour = (time12: string, ampm: 'AM' | 'PM') => {
        if (!time12) return '';
        const [hours, minutes] = time12.split(':');
        let h = parseInt(hours, 10);
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return `${h.toString().padStart(2, '0')}:${minutes}`;
    };

    useEffect(() => {
        if (appointmentToEdit) {
            const { time12, ampm: period } = convertTo12Hour(appointmentToEdit.time);
            setFormData({
                patientName: appointmentToEdit.patientName || '',
                patientMobile: appointmentToEdit.patientMobile || '',
                patientEmail: appointmentToEdit.patientEmail || '',
                date: appointmentToEdit.date,
                time: appointmentToEdit.time,
            });
            setTimeInput(time12);
            setAmpm(period);
        } else {
            setFormData({ patientName: '', patientMobile: '', patientEmail: '', date: '', time: '' });
            setTimeInput('');
            setAmpm('AM');
        }
        setError('');
    }, [appointmentToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTimeInput(value);
        const time24 = convertTo24Hour(value, ampm);
        setFormData({ ...formData, time: time24 });
    };

    const handleAmPmChange = (period: 'AM' | 'PM') => {
        setAmpm(period);
        if (timeInput) {
            const time24 = convertTo24Hour(timeInput, period);
            setFormData({ ...formData, time: time24 });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!formData.date || !formData.time || !formData.patientName || !formData.patientEmail) {
            setError('Patient name, email, date, and time are required.');
            return;
        }
        onSave(formData);
    };

    const inputStyle = "block w-full px-3 py-2 bg-input-bg dark:bg-dark-bg border-transparent dark:border dark:border-dark-subtext/20 rounded-md placeholder-gray-500 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent sm:text-sm text-gray-900 dark:text-dark-text";
    const labelStyle = "block text-sm font-bold text-gray-800 dark:text-dark-text mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                        {appointmentToEdit ? 'Edit Appointment' : 'Schedule Appointment'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg">
                        <CloseIcon className="w-5 h-5 text-gray-600 dark:text-dark-subtext" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <fieldset disabled={isLoading} className="space-y-4">
                            <div>
                                <label htmlFor="patientName" className={labelStyle}>Patient Name</label>
                                <input type="text" name="patientName" value={formData.patientName} onChange={handleChange} className={inputStyle} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="patientMobile" className={labelStyle}>Patient Mobile</label>
                                    <input type="tel" name="patientMobile" value={formData.patientMobile} onChange={handleChange} className={inputStyle} />
                                </div>
                                <div>
                                    <label htmlFor="patientEmail" className={labelStyle}>Patient Email</label>
                                    <input type="email" name="patientEmail" value={formData.patientEmail} onChange={handleChange} className={inputStyle} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="date" className={labelStyle}>Date</label>
                                    <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputStyle} required />
                                </div>
                                <div>
                                    <label htmlFor="time" className={labelStyle}>Time</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="time" 
                                            value={timeInput} 
                                            onChange={handleTimeChange} 
                                            className={`${inputStyle} flex-1`} 
                                            required 
                                        />
                                        <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-dark-subtext/20">
                                            <button
                                                type="button"
                                                onClick={() => handleAmPmChange('AM')}
                                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                                    ampm === 'AM' 
                                                        ? 'bg-primary-green text-white dark:bg-dark-accent' 
                                                        : 'bg-white dark:bg-dark-bg text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-card'
                                                }`}
                                            >
                                                AM
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleAmPmChange('PM')}
                                                className={`px-3 py-2 text-sm font-medium transition-colors ${
                                                    ampm === 'PM' 
                                                        ? 'bg-primary-green text-white dark:bg-dark-accent' 
                                                        : 'bg-white dark:bg-dark-bg text-gray-700 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-card'
                                                }`}
                                            >
                                                PM
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </fieldset>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-subtext/30 rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent border border-transparent rounded-md shadow-sm hover:bg-primary-green-dark dark:hover:bg-opacity-80 disabled:bg-gray-400">
                            {isLoading ? 'Saving...' : 'Save Appointment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DoctorAppointmentForm;