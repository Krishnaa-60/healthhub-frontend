import React, { useState, useMemo } from 'react';
import { User, Appointment } from '../../types';
import { updateUser } from '../../services/db';
import PlusIcon from '../icons/PlusIcon';
import CalendarIcon from '../icons/CalendarIcon';
import Toast from '../Toast';
import DoctorAppointmentCard from './DoctorAppointmentCard';
import DoctorAppointmentForm from './DoctorAppointmentForm';

interface DoctorAppointmentsViewProps {
  doctor: User;
  onUserUpdate: (user: User) => void;
}

const DoctorAppointmentsView: React.FC<DoctorAppointmentsViewProps> = ({ doctor, onUserUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const appointments = doctor.appointments || [];

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();

    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    appointments.forEach(appt => {
      const apptDateTime = new Date(`${appt.date}T${appt.time}`);
      if (apptDateTime >= now) {
        upcoming.push(appt);
      } else {
        past.push(appt);
      }
    });
    
    upcoming.sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    past.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

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
      const updatedUser = await updateUser(doctor.healthId, { appointments: updatedAppointments });
      onUserUpdate(updatedUser);
      setToastMessage('Appointment deleted successfully.');
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
      updatedAppointments = appointments.map(appt =>
        appt.id === editingAppointment.id ? { ...appt, ...formData } : appt
      );
    } else {
      const newAppointment: Appointment = {
        ...formData,
        id: `APT_${Date.now()}`,
      };
      updatedAppointments = [...appointments, newAppointment];
    }

    try {
      const updatedUser = await updateUser(doctor.healthId, { appointments: updatedAppointments });
      onUserUpdate(updatedUser);
      setIsModalOpen(false);
      setEditingAppointment(null);
      setToastMessage(editingAppointment ? 'Appointment updated successfully.' : 'Appointment created and patient notified.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save appointment.');
    } finally {
      setIsLoading(false);
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
      
      <div className="mb-10 bg-white dark:bg-dark-card rounded-xl shadow-lg">
        <div className="p-4 bg-gradient-to-r from-grad-blue-from to-grad-blue-to rounded-t-xl">
            <h2 className="text-xl font-bold text-white">Upcoming Appointments</h2>
        </div>
        <div className="p-6">
            {upcomingAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingAppointments.map(appt => (
                <DoctorAppointmentCard
                    key={appt.id}
                    appointment={appt}
                    onEdit={() => handleEdit(appt)}
                    onDelete={() => handleDelete(appt.id)}
                />
                ))}
            </div>
            ) : (
            <div className="text-center text-gray-500 dark:text-dark-subtext py-10">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/40" />
                <h3 className="text-lg font-semibold">No Upcoming Appointments</h3>
                <p className="text-sm">Click "Add Appointment" to schedule one.</p>
            </div>
            )}
        </div>
      </div>

       <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
        <div className="p-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded-t-xl">
            <h2 className="text-xl font-bold text-white">Past Appointments</h2>
        </div>
         <div className="p-6">
            {pastAppointments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastAppointments.map(appt => (
                <DoctorAppointmentCard
                    key={appt.id}
                    appointment={appt}
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

      <DoctorAppointmentForm
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

export default DoctorAppointmentsView;