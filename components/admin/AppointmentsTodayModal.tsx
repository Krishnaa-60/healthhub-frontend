import React from 'react';
import { User, Appointment, UserRole } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import CalendarIcon from '../icons/CalendarIcon';
import ClockIcon from '../icons/ClockIcon';
import PersonIcon from '../icons/PersonIcon';
import DoctorIcon from '../icons/DoctorIcon';

interface AppointmentWithUser {
    appointment: Appointment;
    user: User;
}

interface AppointmentsTodayModalProps {
    appointments: AppointmentWithUser[];
    onClose: () => void;
}

const AppointmentsTodayModal: React.FC<AppointmentsTodayModalProps> = ({ appointments, onClose }) => {
    const formatTime = (time: string) => {
        // Convert 24h to 12h format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-green to-teal-500 dark:from-dark-accent dark:to-teal-400 p-6 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-lg">
                            <CalendarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Today's Appointments</h2>
                            <p className="text-white/80 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <CloseIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                    {appointments.length === 0 ? (
                        <div className="text-center py-12">
                            <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/30" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2">No Appointments Today</h3>
                            <p className="text-gray-500 dark:text-dark-subtext">There are no scheduled appointments for today.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {appointments.map((item, index) => {
                                const isPatient = item.user.role === UserRole.PATIENT;
                                const isDoctor = item.user.role === UserRole.DOCTOR;

                                return (
                                    <div
                                        key={`${item.user.healthId}-${item.appointment.id}`}
                                        className="bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg dark:to-dark-card border-2 border-gray-200 dark:border-dark-subtext/20 rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            {/* User Info */}
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className={`p-3 rounded-lg ${
                                                    isPatient 
                                                        ? 'bg-blue-100 dark:bg-blue-500/10' 
                                                        : 'bg-green-100 dark:bg-green-500/10'
                                                }`}>
                                                    {isPatient ? (
                                                        <PersonIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <DoctorIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text">
                                                            {item.user.name}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                                            isPatient 
                                                                ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' 
                                                                : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-300'
                                                        }`}>
                                                            {item.user.role}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-dark-subtext mb-2">
                                                        ID: {item.user.healthId}
                                                    </p>
                                                    
                                                    {/* Appointment Details */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                                                        {isPatient && item.appointment.doctorName && (
                                                            <div className="flex items-center gap-2">
                                                                <DoctorIcon className="w-4 h-4 text-gray-500 dark:text-dark-subtext" />
                                                                <span className="text-sm text-gray-700 dark:text-dark-text">
                                                                    Dr. {item.appointment.doctorName}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {isPatient && item.appointment.hospitalName && (
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-gray-500 dark:text-dark-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                <span className="text-sm text-gray-700 dark:text-dark-text">
                                                                    {item.appointment.hospitalName}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {isDoctor && item.appointment.patientName && (
                                                            <div className="flex items-center gap-2">
                                                                <PersonIcon className="w-4 h-4 text-gray-500 dark:text-dark-subtext" />
                                                                <span className="text-sm text-gray-700 dark:text-dark-text">
                                                                    Patient: {item.appointment.patientName}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {isDoctor && item.appointment.patientMobile && (
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-4 h-4 text-gray-500 dark:text-dark-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                                <span className="text-sm text-gray-700 dark:text-dark-text">
                                                                    {item.appointment.patientMobile}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Time Badge */}
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2 px-3 py-2 bg-primary-green/10 dark:bg-dark-accent/10 rounded-lg">
                                                    <ClockIcon className="w-5 h-5 text-primary-green dark:text-dark-accent" />
                                                    <span className="text-sm font-bold text-primary-green dark:text-dark-accent">
                                                        {formatTime(item.appointment.time)}
                                                    </span>
                                                </div>
                                                {item.appointment.reminderSet && (
                                                    <span className="text-xs text-gray-500 dark:text-dark-subtext flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                                                        </svg>
                                                        Reminder Set
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-dark-bg px-6 py-4 border-t border-gray-200 dark:border-dark-subtext/20">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-dark-subtext">
                            Total: <span className="font-bold text-gray-800 dark:text-dark-text">{appointments.length}</span> appointment{appointments.length !== 1 ? 's' : ''}
                        </p>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-primary-green hover:bg-primary-green-dark dark:bg-dark-accent dark:hover:bg-dark-accent/80 text-white font-semibold rounded-lg transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentsTodayModal;
