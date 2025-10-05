import React, { useState, useEffect } from 'react';
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
    const [greeting, setGreeting] = useState('');
    const [animateStats, setAnimateStats] = useState(false);
    
    const totalPatients = doctor.patients?.length || 0;
    const recentCommunications = (doctor.communications || []).slice(0, 3);
    
    // Calculate today's appointments
    const appointmentsToday = (() => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        return (doctor.appointments || []).filter(appt => appt.date === todayStr).length;
    })();

    // Calculate upcoming appointments (next 7 days)
    const upcomingAppointments = (() => {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return (doctor.appointments || []).filter(appt => {
            const apptDate = new Date(appt.date);
            return apptDate >= today && apptDate <= nextWeek;
        }).length;
    })();

    // Total communications
    const totalMessages = doctor.communications?.length || 0;

    // Set greeting based on time
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
        
        // Trigger animation
        setTimeout(() => setAnimateStats(true), 100);
    }, []);

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Header with Gradient */}
            <div className="bg-gradient-to-r from-brand-blue to-accent-blue p-8 rounded-2xl shadow-xl text-white">
                <h1 className="text-4xl font-bold mb-2">{greeting}, Dr. {doctor.name}! 👨‍⚕️</h1>
                <p className="text-blue-100 text-lg">Ready to make a difference today?</p>
            </div>

            {/* Enhanced Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                    onClick={() => setActiveView('patients')}
                    className={`bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${animateStats ? 'animate-slideUp' : 'opacity-0'}`}
                    style={{ animationDelay: '0ms' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Patients</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{totalPatients}</h3>
                        </div>
                        <div className="bg-white/20 p-4 rounded-full">
                            <UsersIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-blue-100 text-sm">
                        <span>View all patients →</span>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveView('appointments')}
                    className={`bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${animateStats ? 'animate-slideUp' : 'opacity-0'}`}
                    style={{ animationDelay: '100ms' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Today's Appointments</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{appointmentsToday}</h3>
                        </div>
                        <div className="bg-white/20 p-4 rounded-full">
                            <CalendarIcon className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-green-100 text-sm">
                        <span>Manage appointments →</span>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveView('appointments')}
                    className={`bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${animateStats ? 'animate-slideUp' : 'opacity-0'}`}
                    style={{ animationDelay: '200ms' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Upcoming (7 Days)</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{upcomingAppointments}</h3>
                        </div>
                        <div className="bg-white/20 p-4 rounded-full">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-purple-100 text-sm">
                        <span>View schedule →</span>
                    </div>
                </div>

                <div 
                    onClick={() => setActiveView('communications')}
                    className={`bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${animateStats ? 'animate-slideUp' : 'opacity-0'}`}
                    style={{ animationDelay: '300ms' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm font-medium">Total Messages</p>
                            <h3 className="text-4xl font-bold text-white mt-2">{totalMessages}</h3>
                        </div>
                        <div className="bg-white/20 p-4 rounded-full">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-orange-100 text-sm">
                        <span>View messages →</span>
                    </div>
                </div>
            </div>
            
             {/* Recent Communications - Enhanced */}
            <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg animate-slideInLeft">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text">Recent Messages</h2>
                        <p className="text-sm text-gray-500 dark:text-dark-subtext mt-1">Latest communications from your patients</p>
                    </div>
                    <button 
                        onClick={() => setActiveView('communications')} 
                        className="px-4 py-2 bg-gradient-to-r from-primary-green to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                        View All →
                    </button>
                </div>
                 <div className="space-y-3">
                    {recentCommunications.length > 0 ? (
                        recentCommunications.map((comm, index) => (
                             <div 
                                key={comm.id} 
                                className="bg-gradient-to-r from-light-green to-green-50 dark:from-dark-bg dark:to-dark-card p-4 rounded-xl flex gap-4 items-center hover:shadow-md transition-all duration-300 cursor-pointer border border-transparent hover:border-primary-green dark:hover:border-dark-accent"
                                onClick={() => setActiveView('communications')}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-primary-green to-teal-500 rounded-full flex-shrink-0 flex items-center justify-center shadow-md">
                                    <UserPlaceholderIcon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-dark-text">
                                        {comm.from.name}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-dark-subtext mt-1">
                                        Sent a message • {new Date(comm.timestamp).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <svg className="w-5 h-5 text-primary-green dark:text-dark-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-bg rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400 dark:text-dark-subtext" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 dark:text-dark-subtext font-medium">No recent messages</p>
                            <p className="text-sm text-gray-400 dark:text-dark-subtext/60 mt-1">Messages from patients will appear here</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default DoctorDashboardHome;