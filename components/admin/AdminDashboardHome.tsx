import React, { useEffect, useState } from 'react';
import { User, UserRole, Appointment } from '../../types';
import { getAllUsers } from '../../services/db';
import AdminStatCard from './AdminStatCard';
import UserBarChart from './charts/UserBarChart';
import RolePieChart from './charts/RolePieChart';
import PersonIcon from '../icons/PersonIcon';
import DoctorIcon from '../icons/DoctorIcon';
import UsersIcon from '../icons/UsersIcon';
import AnalyticsIcon from '../icons/AnalyticsIcon';
import { AdminView } from '../../pages/AdminDashboard';
import AppointmentsTodayModal from './AppointmentsTodayModal';

interface AdminDashboardHomeProps {
    setActiveView: (view: AdminView) => void;
}

interface AppointmentWithUser {
    appointment: Appointment;
    user: User;
}

const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ setActiveView }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
    const [todayAppointments, setTodayAppointments] = useState<AppointmentWithUser[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const allUsers = await getAllUsers();
                setUsers(allUsers.filter(u => u.role !== UserRole.ADMIN)); // Exclude admin from stats
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch users.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const totalUsers = users.length;
    const totalPatients = users.filter(u => u.role === UserRole.PATIENT).length;
    const totalDoctors = users.filter(u => u.role === UserRole.DOCTOR).length;
    
    // Calculate appointments today
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const appointmentsWithUsers: AppointmentWithUser[] = [];
    
    users.forEach(user => {
        if (user.appointments) {
            user.appointments
                .filter(apt => apt.date === today)
                .forEach(apt => {
                    appointmentsWithUsers.push({ appointment: apt, user });
                });
        }
    });
    
    // Sort by time
    appointmentsWithUsers.sort((a, b) => a.appointment.time.localeCompare(b.appointment.time));
    
    const appointmentsToday = appointmentsWithUsers.length;
    
    const handleAppointmentsTodayClick = () => {
        setTodayAppointments(appointmentsWithUsers);
        setShowAppointmentsModal(true);
    };
    
    const recentRegistrations = [...users]
        .filter(u => u.role !== UserRole.ADMIN)
        .sort((a, b) => {
            const idA = parseInt(a.healthId.replace(/\D/g, ''));
            const idB = parseInt(b.healthId.replace(/\D/g, ''));
            return idB - idA;
        })
        .slice(0, 5);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green dark:border-dark-accent"></div>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-400">{error}</p>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-md text-gray-500 dark:text-dark-subtext mt-1">Platform Overview & Statistics</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard icon={UsersIcon} title="Total Users" value={totalUsers} onClick={() => setActiveView('users')} />
                <AdminStatCard icon={PersonIcon} title="Total Patients" value={totalPatients} onClick={() => setActiveView('patients')} />
                <AdminStatCard icon={DoctorIcon} title="Total Doctors" value={totalDoctors} onClick={() => setActiveView('doctors')} />
                <AdminStatCard icon={AnalyticsIcon} title="Appointments Today" value={appointmentsToday} onClick={handleAppointmentsTodayClick} />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-dark-text">User Registrations (Last 7 Days)</h2>
                    <UserBarChart />
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-dark-text">User Role Distribution</h2>
                    <RolePieChart patientCount={totalPatients} doctorCount={totalDoctors} />
                </div>
            </div>

             {/* Recent Registrations */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg">
                <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-dark-text">Recent Registrations</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-dark-subtext/20 text-xs text-gray-500 dark:text-dark-subtext uppercase">
                                <th className="p-3">Name</th>
                                <th className="p-3 hidden md:table-cell">Health ID</th>
                                <th className="p-3">Role</th>
                                <th className="p-3 hidden sm:table-cell">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRegistrations.map(user => (
                                <tr key={user.healthId} className="border-b border-gray-100 dark:border-dark-subtext/10 text-sm">
                                    <td className="p-3 font-medium text-gray-800 dark:text-dark-text">{user.name}</td>
                                    <td className="p-3 hidden md:table-cell text-gray-500 dark:text-dark-subtext">{user.healthId}</td>
                                    <td className="p-3">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === UserRole.PATIENT ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3 hidden sm:table-cell text-gray-500 dark:text-dark-subtext">{user.email || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAppointmentsModal && (
                <AppointmentsTodayModal
                    appointments={todayAppointments}
                    onClose={() => setShowAppointmentsModal(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboardHome;
