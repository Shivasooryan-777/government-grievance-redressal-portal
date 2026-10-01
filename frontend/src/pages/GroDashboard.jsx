import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/useAuth';

export default function GroDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const draftKey = `gro-drafts-${user?.email || 'unknown'}`;
    const getStoredDrafts = () => {
        const storedDrafts = localStorage.getItem(draftKey);
        if (!storedDrafts) return { remarks: {}, actions: {} };
        try {
            const drafts = JSON.parse(storedDrafts);
            return { remarks: drafts.remarks || {}, actions: drafts.actions || {} };
        } catch {
            localStorage.removeItem(draftKey);
            return { remarks: {}, actions: {} };
        }
    };
    const [remarks, setRemarks] = useState(() => getStoredDrafts().remarks);
    const [actions, setActions] = useState(() => getStoredDrafts().actions);

    const saveDrafts = () => {
        localStorage.setItem(draftKey, JSON.stringify({ remarks, actions }));
    };

    const fetchQueue = async () => {
        try {
            const res = await api.get('/api/gro/queue');
            const list = res.data?.data ?? res.data ?? [];
            setQueue(list);
            setError('');
        } catch {
            setError('Failed to load the department queue.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        queueMicrotask(() => { void fetchQueue(); });
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            await api.patch(`/api/gro/grievances/${id}/status`, {
                status: newStatus,
                remarks: remarks[id] || '',
                actionTaken: actions[id] || '',
            });
            await fetchQueue();
        } catch {
            alert('Failed to update status. Ensure this grievance belongs to your department.');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-600">Loading department queue...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">GRO Department Queue</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">{user?.email}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white text-sm px-4 py-2 rounded hover:bg-red-700"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {queue.length === 0 ? (
                <p className="text-gray-500">No grievances assigned to your department.</p>
            ) : (
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {queue.map((g) => (
                                <tr key={g.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{g.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{g.priority}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{g.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <input
                                            className="border rounded p-1 mb-1 w-full"
                                            placeholder="Resolution remarks"
                                            maxLength={2000}
                                            value={remarks[g.id] || ''}
                                            onChange={(e) => setRemarks((items) => ({ ...items, [g.id]: e.target.value }))}
                                        />
                                        <input
                                            className="border rounded p-1 mb-1 w-full"
                                            placeholder="Action taken (optional)"
                                            maxLength={255}
                                            value={actions[g.id] || ''}
                                            onChange={(e) => setActions((items) => ({ ...items, [g.id]: e.target.value }))}
                                        />
                                        <button type="button" className="bg-gray-600 text-white px-2 py-1 rounded mb-1" onClick={saveDrafts}>
                                            Save draft
                                        </button>
                                        <select
                                            className="border rounded p-1"
                                            disabled={updatingId === g.id}
                                            defaultValue=""
                                            onChange={(e) => handleStatusUpdate(g.id, e.target.value)}
                                        >
                                            <option value="" disabled>Update Status</option>
                                            <option value="IN_PROGRESS">In Progress</option>
                                            <option value="RESOLVED">Resolved</option>
                                            <option value="REJECTED">Rejected</option>
                                        </select>
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