import React from 'react';
import { User, MedicalRecord } from '../types';
import { getPatientDoctors, getUserByEmail, shareRecord } from '../services/db';

interface ShareRecordModalProps {
  user: User;
  record: MedicalRecord;
  onClose: () => void;
  onShared: () => void;
}

const ShareRecordModal: React.FC<ShareRecordModalProps> = ({ user, record, onClose, onShared }) => {
  const [connectedDoctors, setConnectedDoctors] = React.useState<User[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>('');
  const [email, setEmail] = React.useState('');
  const [foundDoctor, setFoundDoctor] = React.useState<{ healthId: string; name: string; email: string } | null>(null);
  const [note, setNote] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    const loadConnected = async () => {
      try {
        const docs = await getPatientDoctors(user.healthId);
        setConnectedDoctors(docs || []);
      } catch {}
    };
    loadConnected();
  }, [user.healthId]);

  const handleFindByEmail = async () => {
    setError('');
    setFoundDoctor(null);
    if (!email.trim()) return;
    try {
      const res = await getUserByEmail(email.trim());
      if (res.role !== 'Doctor') {
        setError('The email is not associated with a doctor account.');
        return;
      }
      setFoundDoctor({ healthId: res.healthId, name: res.name, email: res.email });
      setSelectedDoctorId(res.healthId);
    } catch {
      setError('Doctor not found for the provided email.');
    }
  };

  const handleShare = async () => {
    setError('');
    if (!selectedDoctorId) {
      setError('Please select a doctor or search by email.');
      return;
    }
    setLoading(true);
    try {
      await shareRecord(user.healthId, selectedDoctorId, {
        recordId: record.recordId,
        name: record.name,
        category: record.category,
        disease: record.disease,
        files: record.files,
        dateAdded: record.dateAdded,
      }, note || undefined);
      onShared();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to share record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl mx-auto p-4 sm:p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Share "{record.name}"</h3>
          <button onClick={onClose} className="text-sm px-2 py-1 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">Close</button>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Select from your doctors</div>
            <div className="max-h-40 overflow-y-auto rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
              {connectedDoctors.length === 0 ? (
                <div className="p-3 text-sm text-gray-600 dark:text-gray-300">No connected doctors found.</div>
              ) : connectedDoctors.map(doc => (
                <label key={doc.healthId} className="flex items-center gap-2 p-2 border-b last:border-b-0 border-gray-100 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600">
                  <input type="radio" name="doctor" value={doc.healthId} checked={selectedDoctorId === doc.healthId} onChange={() => setSelectedDoctorId(doc.healthId)} />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{doc.name}</span>
                  <span className="text-xs text-gray-600 dark:text-gray-300">({doc.healthId})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-end">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-white">Or search doctor by email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="doctor@example.com" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" />
              {foundDoctor && <div className="mt-1 text-xs text-gray-700 dark:text-gray-300">Found: {foundDoctor.name} ({foundDoctor.email})</div>}
            </div>
            <button onClick={handleFindByEmail} className="px-3 py-2 rounded bg-primary-green text-white font-semibold">Find</button>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-900 dark:text-white">Note (optional)</label>
            <textarea rows={3} value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400" placeholder="Add a note for the doctor" />
          </div>
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white">Cancel</button>
          <button disabled={loading} onClick={handleShare} className="px-4 py-2 rounded bg-primary-green text-white font-bold disabled:opacity-60">{loading ? 'Sharing...' : 'Share'}</button>
        </div>
      </div>
    </div>
  );
};

export default ShareRecordModal;
