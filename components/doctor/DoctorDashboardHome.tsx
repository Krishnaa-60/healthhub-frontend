import React from 'react';
import { User } from '../../types';
import AdminStatCard from '../admin/AdminStatCard';
import UsersIcon from '../icons/UsersIcon';
import CalendarIcon from '../icons/CalendarIcon';
import { DoctorView } from '../../pages/DoctorDashboard';
import UserPlaceholderIcon from '../icons/UserPlaceholderIcon';

interface DoctorDashboardHomeProps {
    doctor: User;
    setActiveView: (view: DoctorView) => void;
}

const DoctorDashboardHome: React.FC<DoctorDashboardHomeProps> = ({ doctor, setActiveView }) => {
    const totalPatients = doctor.patients?.length || 0;
    const recentCommunications = (doctor.communications || []).slice(0, 3);
    
    // Calculate today's appointments
    const appointmentsToday = (() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // Get YYYY-MM-DD format
        return (doctor.appointments || []).filter(appt => appt.date === todayStr).length;
    })();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Welcome, {doctor.name}</h1>
                <p className="text-md text-gray-500 dark:text-dark-subtext mt-1">Here is a summary of your activity.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard icon={UsersIcon} title="Total Patients" value={totalPatients} onClick={() => setActiveView('patients')} />
                <AdminStatCard icon={CalendarIcon} title="Appointments Today" value={appointmentsToday} onClick={() => setActiveView('appointments')} />
            </div>
            
             {/* Recent Communications */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-dark-text">Recent Communications</h2>
                    <button onClick={() => setActiveView('communications')} className="text-sm font-semibold text-primary-green dark:text-dark-accent hover:underline">
                        View All
                    </button>
                </div>
                 <div className="space-y-3">
                    {recentCommunications.length > 0 ? (
                        recentCommunications.map(comm => (
                             <div key={comm.id} className="bg-light-green dark:bg-dark-bg p-3 rounded-lg flex gap-3 items-center">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-dark-card rounded-full flex-shrink-0 flex items-center justify-center">
                                    <UserPlaceholderIcon className="w-5 h-5 text-gray-500 dark:text-dark-subtext" />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm">
                                        <span className="font-bold">{comm.from.name}</span> sent a message.
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-dark-subtext">{new Date(comm.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                         <p className="text-sm text-center text-gray-500 dark:text-dark-subtext py-4">No recent messages from patients.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default DoctorDashboardHome;