import React from 'react';
import { Appointment } from '../../types';
import CalendarIcon from '../icons/CalendarIcon';
import PersonIcon from '../icons/PersonIcon';
import PhoneIcon from '../icons/PhoneIcon';
import ClockIcon from '../icons/ClockIcon';
import EditIcon from '../icons/EditIcon';
import TrashIcon from '../icons/TrashIcon';

interface DoctorAppointmentCardProps {
  appointment: Appointment;
  onEdit?: () => void;
  onDelete?: () => void;
  isPast?: boolean;
}

const formatTime = (time24: string): string => {
    if (!time24) return 'N/A';
    try {
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
        return time24;
    }
};

const DoctorAppointmentCard: React.FC<DoctorAppointmentCardProps> = ({ appointment, onEdit, onDelete, isPast = false }) => {

  const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
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
        <DetailItem icon={<PersonIcon />}>
          <span className="font-bold text-gray-800 dark:text-dark-text text-base">{appointment.patientName}</span>
        </DetailItem>
        {appointment.patientMobile && <DetailItem icon={<PhoneIcon />}>{appointment.patientMobile}</DetailItem>}
        <div className="flex items-center gap-6 pt-2">
            <DetailItem icon={<CalendarIcon />}>{formattedDate}</DetailItem>
            <DetailItem icon={<ClockIcon />}>{formattedTime}</DetailItem>
        </div>
      </div>
      {(onEdit || onDelete) && (
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-dark-subtext/10">
            {onEdit && !isPast && (
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
      )}
    </div>
  );
};

export default DoctorAppointmentCard;