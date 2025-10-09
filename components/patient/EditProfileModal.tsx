import React, { useState, useEffect } from 'react';
import { User, Address, EmergencyContact } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onSave: (updatedData: Partial<User>) => void;
}

type FormData = Omit<User, 'healthId' | 'role' | 'password' | 'medicalRecords' | 'appointments' | 'prescriptions' | 'doctors' | 'communications' | 'securityQuestion' | 'securityAnswer'>;


const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [formData, setFormData] = useState<Partial<FormData>>({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: user.name || '',
                birthdate: user.birthdate || '',
                mobileNo: user.mobileNo || '',
                aadharNo: user.aadharNo || '',
                email: user.email || '',
                bloodGroup: user.bloodGroup || '',
                address: { ...(user.address || {}) } as Address,
                emergencyContact: { ...(user.emergencyContact || {}), address: { ...(user.emergencyContact?.address || {}) } } as EmergencyContact,
            });
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } as Address }));
    };

    const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [name]: value } as EmergencyContact }));
    };
    
    const handleEmergencyAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, address: { ...prev.emergencyContact?.address, [name]: value } } as EmergencyContact }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // The onSave function passed from props will handle the API call
        await onSave(formData);
        setIsLoading(false);
    };

    const inputStyle = "block w-full px-3 py-2 bg-input-bg dark:bg-dark-bg border-transparent dark:border dark:border-dark-subtext/20 rounded-md placeholder-gray-500 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent sm:text-sm text-gray-900 dark:text-dark-text";
    const labelStyle = "block text-sm font-bold text-gray-800 dark:text-dark-text mb-1";
    const sectionHeaderStyle = "text-lg font-bold text-primary-green dark:text-dark-accent pb-2 mb-4 border-b-2 border-primary-green/20 dark:border-dark-accent/20";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg"><CloseIcon className="w-5 h-5 text-gray-600 dark:text-dark-subtext" /></button>
                </div>
                <form onSubmit={handleSubmit} id="edit-profile-form" className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <fieldset disabled={isLoading} className="space-y-6">
                            {/* Personal Details */}
                            <section>
                                <h3 className={sectionHeaderStyle}>Personal Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className={labelStyle}>Full Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Birthdate</label><input type="text" name="birthdate" value={formData.birthdate} onChange={handleChange} placeholder="dd-mm-yyyy" className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Aadhar No.</label><input type="text" name="aadharNo" value={formData.aadharNo} onChange={handleChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Blood Group</label>
                                        <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className={inputStyle}>
                                            <option>select</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Contact Details */}
                            <section>
                                <h3 className={sectionHeaderStyle}>Contact Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className={labelStyle}>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Mobile No.</label><input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} className={inputStyle} /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div><label className={labelStyle}>Address Line 1</label><input type="text" name="address1" value={formData.address?.address1} onChange={handleAddressChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Address Line 2</label><input type="text" name="address2" value={formData.address?.address2} onChange={handleAddressChange} className={inputStyle} /></div>
                                </div>
                                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                                    <input type="text" name="landmark" placeholder="Landmark" value={formData.address?.landmark} onChange={handleAddressChange} className={inputStyle} />
                                    <input type="text" name="district" placeholder="District" value={formData.address?.district} onChange={handleAddressChange} className={inputStyle} />
                                    <input type="text" name="pincode" placeholder="Pincode" value={formData.address?.pincode} onChange={handleAddressChange} className={inputStyle} />
                                    <input type="text" name="state" placeholder="State" value={formData.address?.state} onChange={handleAddressChange} className={inputStyle} />
                                </div>
                            </section>

                            {/* Emergency Contact */}
                             <section>
                                <h3 className={sectionHeaderStyle}>Emergency Contact</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className={labelStyle}>Contact Name</label><input type="text" name="name" value={formData.emergencyContact?.name} onChange={handleEmergencyContactChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Relation</label><input type="text" name="relation" value={formData.emergencyContact?.relation} onChange={handleEmergencyContactChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Mobile No.</label><input type="tel" name="mobile" value={formData.emergencyContact?.mobile} onChange={handleEmergencyContactChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Email</label><input type="email" name="email" value={formData.emergencyContact?.email} onChange={handleEmergencyContactChange} className={inputStyle} /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <div><label className={labelStyle}>Address Line 1</label><input type="text" name="address1" value={formData.emergencyContact?.address?.address1} onChange={handleEmergencyAddressChange} className={inputStyle} /></div>
                                    <div><label className={labelStyle}>Address Line 2</label><input type="text" name="address2" value={formData.emergencyContact?.address?.address2} onChange={handleEmergencyAddressChange} className={inputStyle} /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    <input type="text" name="district" placeholder="District" value={formData.emergencyContact?.address?.district} onChange={handleEmergencyAddressChange} className={inputStyle} />
                                    <input type="text" name="state" placeholder="State" value={formData.emergencyContact?.address?.state} onChange={handleEmergencyAddressChange} className={inputStyle} />
                                </div>
                            </section>
                        </fieldset>
                    </div>
                </form>
                <div className="sticky bottom-0 px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end gap-3 border-t dark:border-dark-subtext/20">
                    <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-subtext/30 rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 text-sm font-medium text-white bg-primary-green border border-transparent rounded-md shadow-sm hover:bg-primary-green-dark disabled:bg-gray-400" form="edit-profile-form">
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;