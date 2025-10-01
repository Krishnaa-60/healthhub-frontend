import React from 'react';
import { Appointment } from '../types';
import CalendarIcon from './icons/CalendarIcon';
import HospitalIcon from './icons/HospitalIcon';
import DoctorIcon from './icons/DoctorIcon';
import ClockIcon from './icons/ClockIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import BellIcon from './icons/BellIcon';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetReminder?: () => void;
  isPast?: boolean;
}

const formatTime = (time24: string): string => {
    if (!time24) return 'N/A';
    try {
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12; // Convert 0 to 12
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
        return time24; // Fallback to original string if format is unexpected
    }
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onEdit, onDelete, onSetReminder, isPast = false }) => {

  const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // Ensure date is not shifted by timezone
  });

  const formattedTime = formatTime(appointment.time);

  const DetailItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode; }> = ({ icon, children }) => (
    <div className="flex items-center text-sm text-gray-600 dark:text-dark-subtext">
      <div className="w-5 h-5 mr-3 text-gray-400 dark:text-dark-subtext/80">{icon}</div>
      <span>{children}</span>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-dark-card rounded-lg shadow-md p-5 flex flex-col justify-between border-l-4 ${isPast ? 'border-gray-300 dark:border-dark-subtext/40 opacity-80' : 'border-primary-green dark:border-dark-accent'}`}>
      <div className="space-y-3">
        <DetailItem icon={<HospitalIcon />}>
          <span className="font-bold text-gray-800 dark:text-dark-text text-base">{appointment.hospitalName}</span>
        </DetailItem>
        <DetailItem icon={<DoctorIcon />}>{appointment.doctorName}</DetailItem>
        <div className="flex items-center gap-6 pt-2">
            <DetailItem icon={<CalendarIcon />}>{formattedDate}</DetailItem>
            <DetailItem icon={<ClockIcon />}>{formattedTime}</DetailItem>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-dark-subtext/10">
        {!isPast && onSetReminder && (
          <button
            onClick={onSetReminder}
            className={`p-2 rounded-full transition-colors ${
                appointment.reminderSet 
                ? 'text-green-600 bg-green-50 hover:bg-green-100 dark:bg-dark-accent/10 dark:text-dark-accent dark:hover:bg-dark-accent/20' 
                : 'text-gray-500 dark:text-dark-subtext hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-dark-bg'
            }`}
            aria-label={appointment.reminderSet ? 'Cancel email reminder' : 'Set email reminder'}
            title={appointment.reminderSet ? 'Cancel email reminder' : 'Set email reminder'}
          >
            <BellIcon className={`w-5 h-5 ${appointment.reminderSet ? 'fill-current' : ''}`} />
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 dark:text-dark-subtext hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-dark-bg rounded-full transition-colors"
            aria-label="Edit appointment"
          >
            <EditIcon className="w-5 h-5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 dark:text-dark-subtext hover:text-red-600 hover:bg-red-50 dark:hover:bg-dark-bg rounded-full transition-colors"
            aria-label="Delete appointment"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;