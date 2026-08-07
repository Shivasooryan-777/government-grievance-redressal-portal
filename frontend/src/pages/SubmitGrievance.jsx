import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function SubmitGrievance() {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/grievances', { subject, description });
            if (res.data.success) {
                setStatusMsg({ type: 'success', text: `Submitted! Tracking ID: ${res.data.data.trackingId}` });
                setTimeout(() => navigate('/dashboard'), 2000);
            }
        } catch (err) {
            setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Submission failed.' });
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h2 className="text-2xl font-bold mb-6">Submit New Grievance</h2>
            {statusMsg.text && <p className={`mb-4 p-2 rounded ${statusMsg.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{statusMsg.text}</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full p-2 border rounded mb-4" required />
                <textarea placeholder="Describe your grievance (min 20 chars)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 border rounded mb-6 h-32" required />
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Submit</button>
            </form>
        </div>
    );
}