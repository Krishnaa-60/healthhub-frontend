import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { User, UserRole } from '../../types';
import { getAllUsers, deleteUser } from '../../services/db';
import SearchIcon from '../icons/SearchIcon';
import TrashIcon from '../icons/TrashIcon';
import PlusIcon from '../icons/PlusIcon';
import Toast from '../Toast';
import AddAdminModal from './AddAdminModal';
import SortIcon from '../icons/SortIcon';

type SortDirection = 'ascending' | 'descending';
type SortKey = 'name' | 'email' | 'healthId';

interface AdminManagementViewProps {
    onViewUser: (user: User) => void;
}

const AdminManagementView: React.FC<AdminManagementViewProps> = ({ onViewUser }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const users = await getAllUsers();
            setAllUsers(users);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch users.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDeleteUser = async (user: User) => {
        if (user.email === 'krishna@gmail.com') {
            alert('The permanent admin account cannot be deleted.');
            return;
        }
        if (window.confirm(`Are you sure you want to delete admin "${user.name}" (${user.email})?`)) {
            try {
                await deleteUser(user.healthId);
                setAllUsers(prevUsers => prevUsers.filter(u => u.healthId !== user.healthId));
                setToastMessage(`Admin ${user.name} has been deleted.`);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete user.');
            }
        }
    };

    const sortedAndFilteredAdmins = useMemo(() => {
        let filtered = allUsers.filter(user => user.role === UserRole.ADMIN);

        if (searchQuery) {
            filtered = filtered.filter(user =>
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.healthId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }
        
        if (sortConfig !== null) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [allUsers, searchQuery, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode, className?: string }> = ({ sortKey, children, className = '' }) => (
         <th className={`p-3 cursor-pointer select-none ${className}`} onClick={() => requestSort(sortKey)}>
            <div className="flex items-center">
              {children}
              <SortIcon direction={sortConfig?.key === sortKey ? sortConfig.direction : null} />
            </div>
        </th>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Admin Management</h1>
                    <p className="text-md text-gray-500 dark:text-dark-subtext mt-1">Manage all administrator accounts.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-green dark:bg-dark-accent text-white dark:text-dark-bg font-semibold rounded-lg shadow-sm hover:bg-opacity-80 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Admin
                </button>
            </div>
            
            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-lg">
                 <div className="relative mb-4">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-subtext pointer-events-none" />
                    <input
                        type="search"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-light-green dark:bg-dark-bg border border-gray-200 dark:border-dark-subtext/20 rounded-lg focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent focus:outline-none transition-all"
                    />
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green dark:border-dark-accent"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-400 text-center">{error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-dark-subtext/20 text-xs text-gray-500 dark:text-dark-subtext uppercase">
                                    <SortableHeader sortKey="name">Name</SortableHeader>
                                    <SortableHeader sortKey="email">Email</SortableHeader>
                                    <SortableHeader sortKey="healthId" className="hidden md:table-cell">Health ID</SortableHeader>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredAdmins.map(user => (
                                    <tr 
                                        key={user.healthId} 
                                        className="border-b border-gray-100 dark:border-dark-subtext/10 text-sm hover:bg-light-green dark:hover:bg-dark-bg cursor-pointer"
                                        onClick={() => onViewUser(user)}
                                    >
                                        <td className="p-3 font-medium text-gray-800 dark:text-dark-text">{user.name}</td>
                                        <td className="p-3 text-gray-500 dark:text-dark-subtext">{user.email}</td>
                                        <td className="p-3 hidden md:table-cell text-gray-500 dark:text-dark-subtext">{user.healthId}</td>
                                        <td className="p-3 text-right">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteUser(user); }}
                                                className="p-2 text-gray-500 dark:text-dark-subtext hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors disabled:text-gray-600 dark:disabled:text-dark-subtext/30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                                                title={user.email === 'krishna@gmail.com' ? 'Cannot delete permanent admin' : `Delete ${user.name}`}
                                                disabled={user.email === 'krishna@gmail.com'}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
             <Toast message={toastMessage} onClose={() => setToastMessage('')} />
             {isAddModalOpen && (
                <AddAdminModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchUsers();
                        setToastMessage('New admin added successfully!');
                    }}
                />
             )}
        </div>
    );
};

export default AdminManagementView;