import React, { useMemo, useState, useEffect } from 'react';
import { User, DashboardView, Appointment } from '../types';
import { generateHealthTip } from '../services/db';
import PersonIcon from './icons/PersonIcon';
import CalendarIcon from './icons/CalendarIcon';
import DocumentIcon from './icons/DocumentIcon';
import PrescriptionIcon from './icons/PrescriptionIcon';
import AppointmentCard from './AppointmentCard';
import SearchIcon from './icons/SearchIcon';
import LightbulbIcon from './icons/LightbulbIcon';

interface DashboardHomeViewProps {
  user: User;
  setActiveView: (view: DashboardView) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

interface NavCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  view: DashboardView;
  onClick: (view: DashboardView) => void;
  gradientClass: string;
}

const HealthTipCard: React.FC = () => {
    const [tip, setTip] = useState<string>('Loading your daily health tip...');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            setIsLoading(true);
            try {
                const response = await generateHealthTip();
                setTip(response.tip);
            } catch (error) {
                console.error("Failed to fetch health tip:", error);
                setTip("Remember to stay hydrated by drinking plenty of water throughout the day."); // Fallback tip
            } finally {
                setIsLoading(false);
            }
        };
        fetchTip();
    }, []);

    return (
        <div className="bg-gradient-to-r from-teal-400 to-primary-green p-5 rounded-xl shadow-lg flex items-start gap-4 text-white">
            <div className="bg-white/30 rounded-full p-2 flex-shrink-0">
                <LightbulbIcon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold">Health Tip of the Day</h3>
                <p className="text-sm mt-1 transition-opacity duration-300" style={{ opacity: isLoading ? 0.5 : 1 }}>
                    {tip}
                </p>
            </div>
        </div>
    );
};


const NavCard: React.FC<NavCardProps> = ({ icon, title, description, view, onClick, gradientClass }) => (
  <button
    onClick={() => onClick(view)}
    className={`p-6 rounded-2xl text-left text-white transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-opacity-50 ${gradientClass}`}
  >
    <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
      {icon}
    </div>
    <h3 className="font-bold text-lg">{title}</h3>
    <p className="text-sm opacity-80 mt-1">{description}</p>
  </button>
);

const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({ user, setActiveView, searchQuery, setSearchQuery }) => {
  const nextAppointment = useMemo((): Appointment | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = (user.appointments || [])
      .filter(appt => {
          const dateParts = appt.date.split('-').map(p => parseInt(p, 10));
          const apptDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
          return apptDate >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [user.appointments]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('search');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Hi, {user.name}</h1>
        <p className="text-md text-gray-500 dark:text-dark-subtext mt-1">Welcome to your Healthhub Dashboard</p>
      </div>

      <form onSubmit={handleSearchSubmit} className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="search"
          placeholder="Search for records, appointments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-subtext/20 rounded-lg shadow-sm focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent focus:outline-none transition-all focus:shadow-lg text-gray-800 dark:text-dark-text"
        />
      </form>

      <HealthTipCard />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <NavCard
          onClick={setActiveView}
          view="profile"
          icon={<PersonIcon className="w-6 h-6" />}
          title="My Profile"
          description="Manage your personal details"
          gradientClass="bg-gradient-to-br from-grad-blue-from to-grad-blue-to focus:ring-blue-300"
        />
        <NavCard
          onClick={setActiveView}
          view="appointments"
          icon={<CalendarIcon className="w-6 h-6" />}
          title="Appointments"
          description="Schedule and view upcoming visits"
          gradientClass="bg-gradient-to-br from-grad-purple-from to-grad-purple-to focus:ring-purple-300"
        />
        <NavCard
          onClick={setActiveView}
          view="records"
          icon={<DocumentIcon className="w-6 h-6" />}
          title="Medical Records"
          description="Access your health records securely"
           gradientClass="bg-gradient-to-br from-grad-lime-from to-grad-lime-to focus:ring-lime-300 text-green-900"
        />
        <NavCard
          onClick={setActiveView}
          view="prescriptions"
          icon={<PrescriptionIcon className="w-6 h-6" />}
          title="Prescriptions"
          description="Manage your medication schedules"
          gradientClass="bg-gradient-to-br from-grad-red-from to-grad-red-to focus:ring-red-300"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-dark-text">Next Appointment</h2>
            <button
                onClick={() => setActiveView('appointments')}
                className="text-sm font-semibold text-primary-green dark:text-dark-accent hover:underline"
            >
                View All
            </button>
        </div>
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-md">
          {nextAppointment ? (
            <AppointmentCard
              appointment={nextAppointment}
            />
          ) : (
            <div className="text-center text-gray-500 dark:text-dark-subtext py-10">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/40" />
                <h3 className="text-lg font-semibold">No Upcoming Appointments</h3>
                <p className="text-sm">You're all clear! Schedule a new one from the appointments page.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default DashboardHomeView;