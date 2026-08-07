import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CitizenDashboard() {
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const res = await api.get('/api/grievances/mine');
                if (res.data.success) setGrievances(res.data.data);
            } catch (err) { /* Handled by interceptor */ } finally { setLoading(false); }
        };
        fetchGrievances();
    }, []);

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
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {grievances.map(g => (
                                <tr key={g.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">{g.trackingId}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{g.status}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{g.priority}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}