import React, { useState, useMemo } from 'react';
import { User, Appointment } from '../types';
import { updateUser } from '../services/db';
import PlusIcon from '../components/icons/PlusIcon';
import AppointmentCard from './AppointmentCard';
import AppointmentForm from './AppointmentForm';
import CalendarIcon from './icons/CalendarIcon';
import Toast from './Toast';

interface AppointmentsViewProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ user, onUserUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const appointments = user.appointments || [];

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    appointments.forEach(appt => {
      // FIX: Parse date as local timezone midnight to avoid timezone issues
      const dateParts = appt.date.split('-').map(p => parseInt(p, 10));
      const apptDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      if (apptDate >= today) {
        upcoming.push(appt);
      } else {
        past.push(appt);
      }
    });
    
    // Sort upcoming appointments from soonest to latest
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    // Sort past appointments from most recent to oldest
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcomingAppointments: upcoming, pastAppointments: past };
  }, [appointments]);

  const handleAddNew = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    setIsLoading(true);
    setError('');
    try {
      const updatedAppointments = appointments.filter(appt => appt.id !== appointmentId);
      const updatedUser = await updateUser(user.healthId, { appointments: updatedAppointments });
      onUserUpdate(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (formData: Omit<Appointment, 'id'>) => {
    setIsLoading(true);
    setError('');
    let updatedAppointments: Appointment[];

    if (editingAppointment) {
      // Update existing
      updatedAppointments = appointments.map(appt =>
        appt.id === editingAppointment.id ? { ...appt, ...formData } : appt
      );
    } else {
      // Add new
      const newAppointment: Appointment = {
        ...formData,
        id: `APT_${Date.now()}`,
        reminderSet: false,
      };
      updatedAppointments = [...appointments, newAppointment];
    }

    try {
      const updatedUser = await updateUser(user.healthId, { appointments: updatedAppointments });
      onUserUpdate(updatedUser);
      setIsModalOpen(false);
      setEditingAppointment(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save appointment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetReminder = async (appointmentId: string) => {
    const appointment = appointments.find(appt => appt.id === appointmentId);
    if (!appointment) return;

    const newReminderState = !appointment.reminderSet;
    const optimisticAppointments = appointments.map(appt => 
        appt.id === appointmentId ? { ...appt, reminderSet: newReminderState } : appt
    );

    // Optimistic UI update for immediate feedback
    onUserUpdate({ ...user, appointments: optimisticAppointments });

    try {
        const updatedUser = await updateUser(user.healthId, { appointments: optimisticAppointments });
        onUserUpdate(updatedUser); // Sync with final state from DB

        if (newReminderState) {
            setToastMessage(`Reminder set! An email will be sent to ${user.email}.`);
        } else {
            setToastMessage('Reminder cancelled.');
        }

    } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update reminder.');
        // Revert optimistic update on error
        onUserUpdate({ ...user, appointments });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Appointments</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-sm hover:bg-primary-green-dark transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Appointment
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      
      {/* Upcoming Appointments */}
      <div className="mb-10 bg-white dark:bg-dark-card rounded-xl shadow-lg">
        <div className="p-4 bg-gradient-to-r from-grad-blue-from to-grad-blue-to rounded-t-xl">
            <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
        </div>
        <div className="p-6">
            {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingAppointments.map(appt => (
                <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onEdit={() => handleEdit(appt)}
                    onDelete={() => handleDelete(appt.id)}
                    onSetReminder={() => handleSetReminder(appt.id)}
                />
                ))}
            </div>
            ) : (
            <div className="text-center text-gray-500 dark:text-dark-subtext py-10">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/40" />
                <h3 className="text-lg font-semibold">No Upcoming Appointments</h3>
                <p className="text-sm">You're all clear! Click "Add Appointment" to schedule a new one.</p>
            </div>
            )}
        </div>
      </div>

      {/* Past Appointments */}
       <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
        <div className="p-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-t-xl">
            <h2 className="text-xl font-bold text-white">Past Appointments</h2>
        </div>
         <div className="p-6">
            {pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastAppointments.map(appt => (
                <AppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onEdit={() => handleEdit(appt)}
                    onDelete={() => handleDelete(appt.id)}
                    isPast
                />
                ))}
            </div>
            ) : (
            <div className="text-center text-gray-500 dark:text-dark-subtext py-10">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/40" />
                <h3 className="text-lg font-semibold">No Past Appointments</h3>
                <p className="text-sm">Your appointment history will appear here.</p>
            </div>
            )}
        </div>
      </div>

      <AppointmentForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        appointmentToEdit={editingAppointment}
        isLoading={isLoading}
      />

      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default AppointmentsView;