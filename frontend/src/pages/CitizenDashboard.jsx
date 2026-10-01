import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

export default function CitizenDashboard() {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({});
    const [feedbackError, setFeedbackError] = useState({});
    const [submittingId, setSubmittingId] = useState(null);
    const { logout } = useAuth();

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const res = await api.get('/api/grievances/mine');
                if (res.data.success) setGrievances(res.data.data);
            } catch { /* Handled by interceptor */ } finally { setLoading(false); }
        };
        fetchGrievances();
    }, []);

    const submitFeedback = async (grievanceId) => {
        const current = feedback[grievanceId] || {};
        if (!current.rating) {
            setFeedbackError((errors) => ({ ...errors, [grievanceId]: 'Select a rating first.' }));
            return;
        }
        setSubmittingId(grievanceId);
        try {
            const res = await api.post(`/api/grievances/${grievanceId}/feedback`, {
                rating: Number(current.rating),
                comment: current.comment || '',
            });
            if (res.data.success) {
                setGrievances((items) => items.map((item) => item.id === grievanceId ? res.data.data : item));
            }
        } catch (err) {
            setFeedbackError((errors) => ({
                ...errors,
                [grievanceId]: err.response?.data?.message || 'Feedback submission failed.',
            }));
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">My Grievances</h1>
                <div className="space-x-4">
                    <Link to="/submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ New Grievance</Link>
                    <button onClick={logout} className="text-red-600 hover:underline">Logout</button>
                </div>
            </div>

            {loading ? <p>Loading...</p> : grievances.length === 0 ? <p className="text-gray-500">No grievances submitted yet.</p> : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Feedback</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {grievances.map(g => (
                                <tr key={g.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{g.trackingId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{g.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{g.priority}</td>
                                    <td className="px-6 py-4 text-sm">
                                        {g.feedback ? <span className="text-green-700">Rated {g.feedback.rating}/5</span> : g.status === 'RESOLVED' ? (
                                            <div className="min-w-56 space-y-2">
                                                <select
                                                    className="border rounded p-1"
                                                    value={feedback[g.id]?.rating || ''}
                                                    onChange={(e) => setFeedback((items) => ({ ...items, [g.id]: { ...items[g.id], rating: e.target.value } }))}
                                                >
                                                    <option value="">Rating</option>
                                                    {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}/5</option>)}
                                                </select>
                                                <input
                                                    className="border rounded p-1 w-full"
                                                    placeholder="Optional comment"
                                                    maxLength={1000}
                                                    value={feedback[g.id]?.comment || ''}
                                                    onChange={(e) => setFeedback((items) => ({ ...items, [g.id]: { ...items[g.id], comment: e.target.value } }))}
                                                />
                                                <button className="bg-blue-600 text-white px-2 py-1 rounded" disabled={submittingId === g.id} onClick={() => submitFeedback(g.id)}>
                                                    {submittingId === g.id ? 'Submitting...' : 'Submit'}
                                                </button>
                                                {feedbackError[g.id] && <p className="text-red-600 text-xs">{feedbackError[g.id]}</p>}
                                            </div>
                                        ) : <span className="text-gray-400">Available after resolution</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}