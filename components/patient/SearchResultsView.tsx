import React, { useMemo } from 'react';
import { User, DashboardView, Appointment, MedicalRecord, Prescription } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import AppointmentCard from '../AppointmentCard';
import DocumentIcon from '../icons/DocumentIcon';
import PrescriptionIcon from '../icons/PrescriptionIcon';

interface SearchResultsViewProps {
    user: User;
    query: string;
    setActiveView: (view: DashboardView) => void;
}

const SearchResultsView: React.FC<SearchResultsViewProps> = ({ user, query, setActiveView }) => {

    const lowerCaseQuery = query.toLowerCase();

    const filteredAppointments = useMemo(() => {
        if (!lowerCaseQuery) return [];
        return (user.appointments || []).filter(appt => 
            appt.doctorName.toLowerCase().includes(lowerCaseQuery) ||
            appt.hospitalName.toLowerCase().includes(lowerCaseQuery)
        );
    }, [user.appointments, lowerCaseQuery]);

    const filteredRecords = useMemo(() => {
        if (!lowerCaseQuery) return [];
        return (user.medicalRecords || []).filter(rec => 
            rec.name.toLowerCase().includes(lowerCaseQuery) ||
            rec.category.toLowerCase().includes(lowerCaseQuery) ||
            rec.disease.toLowerCase().includes(lowerCaseQuery)
        );
    }, [user.medicalRecords, lowerCaseQuery]);
    
    const filteredPrescriptions = useMemo(() => {
        if (!lowerCaseQuery) return [];
        return (user.prescriptions || []).filter(pres => 
            pres.name.toLowerCase().includes(lowerCaseQuery) ||
            (pres.doctorName && pres.doctorName.toLowerCase().includes(lowerCaseQuery)) ||
            pres.medications.some(med => med.name.toLowerCase().includes(lowerCaseQuery))
        );
    }, [user.prescriptions, lowerCaseQuery]);

    const totalResults = filteredAppointments.length + filteredRecords.length + filteredPrescriptions.length;

    const Highlight: React.FC<{ text: string }> = ({ text }) => {
        if (!lowerCaseQuery) return <>{text}</>;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <>
                {parts.map((part, i) =>
                    part.toLowerCase() === lowerCaseQuery ? (
                        <mark key={i} className="bg-yellow-200 dark:bg-yellow-400 text-black px-0.5 rounded">
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </>
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <button onClick={() => setActiveView('home')} className="text-sm font-semibold text-primary-green hover:underline mb-2">
                    &larr; Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Search Results for "{query}"</h1>
                <p className="text-md text-gray-500 dark:text-dark-subtext mt-1">{totalResults} result(s) found</p>
            </div>

            {totalResults === 0 && (
                 <div className="text-center text-gray-500 dark:text-dark-subtext py-16 bg-white dark:bg-dark-card rounded-xl shadow-md">
                    <SearchIcon className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/40" />
                    <h3 className="text-lg font-semibold">No Results Found</h3>
                    <p className="text-sm">Try searching for something else.</p>
                </div>
            )}
            
            {filteredAppointments.length > 0 && (
                <section>
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-dark-text mb-4">Appointments ({filteredAppointments.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredAppointments.map(appt => <AppointmentCard key={appt.id} appointment={appt} />)}
                    </div>
                </section>
            )}

            {filteredRecords.length > 0 && (
                 <section>
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-dark-text mb-4">Medical Records ({filteredRecords.length})</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredRecords.map(rec => (
                             <div key={rec.recordId} className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md border-l-4 border-blue-400 dark:border-blue-500">
                                <h4 className="font-bold text-gray-800 dark:text-dark-text"><Highlight text={rec.name} /></h4>
                                <p className="text-sm text-gray-500 dark:text-dark-subtext"><Highlight text={rec.category} /> for <Highlight text={rec.disease} /></p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {filteredPrescriptions.length > 0 && (
                 <section>
                    <h2 className="text-2xl font-bold text-gray-700 dark:text-dark-text mb-4">Prescriptions ({filteredPrescriptions.length})</h2>
                    <div className="space-y-4">
                        {filteredPrescriptions.map(pres => (
                             <div key={pres.id} className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-md border-l-4 border-purple-400 dark:border-purple-500">
                                <h4 className="font-bold text-gray-800 dark:text-dark-text"><Highlight text={pres.name} /></h4>
                                <p className="text-sm text-gray-500 dark:text-dark-subtext">by {pres.doctorName || 'N/A'}</p>
                                <ul className="mt-2 text-sm list-disc list-inside text-gray-600 dark:text-dark-subtext">
                                    {pres.medications
                                        .filter(med => med.name.toLowerCase().includes(lowerCaseQuery))
                                        .map(med => <li key={med.id}><Highlight text={med.name} /></li>)
                                    }
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default SearchResultsView;