import React, { useState } from 'react';
import { User } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface EditDoctorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: User;
    onSave: (updatedData: Partial<User>) => void;
}

const EditDoctorProfileModal: React.FC<EditDoctorProfileModalProps> = ({ isOpen, onClose, doctor, onSave }) => {
    const [formData, setFormData] = useState({
        name: doctor.name || '',
        email: doctor.email || '',
        mobileNo: doctor.mobileNo || '',
        specialization: doctor.specialization || '',
        experience: doctor.experience || '',
        qualification: doctor.qualification || '',
        licenseNumber: doctor.licenseNumber || '',
        address: {
            address1: doctor.address?.address1 || '',
            address2: doctor.address?.address2 || '',
            landmark: doctor.address?.landmark || '',
            district: doctor.address?.district || '',
            state: doctor.address?.state || '',
            pincode: doctor.address?.pincode || '',
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    const inputClass = "w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-300 dark:border-dark-subtext/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue dark:focus:ring-dark-accent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text";
    const labelClass = "block text-xs sm:text-sm font-semibold text-gray-700 dark:text-dark-subtext mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-gradient-to-r from-brand-blue to-accent-blue p-4 sm:p-6 rounded-t-2xl flex justify-between items-center z-10">
                    <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
                        <CloseIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-dark-text mb-4 pb-2 border-b border-gray-200 dark:border-dark-subtext/20">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className={labelClass}>Full Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className={labelClass}>Email *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="mobileNo" className={labelClass}>Mobile Number *</label>
                                <input
                                    type="tel"
                                    id="mobileNo"
                                    name="mobileNo"
                                    value={formData.mobileNo}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-dark-text mb-4 pb-2 border-b border-gray-200 dark:border-dark-subtext/20">Professional Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="specialization" className={labelClass}>Specialization</label>
                                <input
                                    type="text"
                                    id="specialization"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g., Cardiologist, Pediatrician"
                                />
                            </div>
                            <div>
                                <label htmlFor="experience" className={labelClass}>Experience (years)</label>
                                <input
                                    type="text"
                                    id="experience"
                                    name="experience"
                                    value={formData.experience}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g., 5"
                                />
                            </div>
                            <div>
                                <label htmlFor="qualification" className={labelClass}>Qualification</label>
                                <input
                                    type="text"
                                    id="qualification"
                                    name="qualification"
                                    value={formData.qualification}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="e.g., MBBS, MD"
                                />
                            </div>
                            <div>
                                <label htmlFor="licenseNumber" className={labelClass}>License Number</label>
                                <input
                                    type="text"
                                    id="licenseNumber"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleChange}
                                    className={inputClass}
                                    placeholder="Medical License Number"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-dark-text mb-4 pb-2 border-b border-gray-200 dark:border-dark-subtext/20">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="address.address1" className={labelClass}>Address Line 1</label>
                                <input
                                    type="text"
                                    id="address.address1"
                                    name="address.address1"
                                    value={formData.address.address1}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="address.address2" className={labelClass}>Address Line 2</label>
                                <input
                                    type="text"
                                    id="address.address2"
                                    name="address.address2"
                                    value={formData.address.address2}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="address.landmark" className={labelClass}>Landmark</label>
                                <input
                                    type="text"
                                    id="address.landmark"
                                    name="address.landmark"
                                    value={formData.address.landmark}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="address.district" className={labelClass}>District</label>
                                <input
                                    type="text"
                                    id="address.district"
                                    name="address.district"
                                    value={formData.address.district}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="address.state" className={labelClass}>State</label>
                                <input
                                    type="text"
                                    id="address.state"
                                    name="address.state"
                                    value={formData.address.state}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="address.pincode" className={labelClass}>Pincode</label>
                                <input
                                    type="text"
                                    id="address.pincode"
                                    name="address.pincode"
                                    value={formData.address.pincode}
                                    onChange={handleChange}
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-subtext/20">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 dark:bg-dark-bg text-gray-700 dark:text-dark-text font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-dark-bg/80 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-full sm:w-auto px-6 py-2.5 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditDoctorProfileModal;
