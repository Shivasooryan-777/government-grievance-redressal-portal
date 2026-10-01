import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Login({ expectedRole = 'CITIZEN' }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, logout } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const role = await login(email, password);
            if (role !== expectedRole) {
                logout();
                setError(`This portal is for ${expectedRole === 'GRO' ? 'GRO' : 'citizen'} accounts.`);
                return;
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">{expectedRole === 'GRO' ? 'GRO Login' : 'Citizen Login'}</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-4" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mb-6" required />
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Login</button>
                <p className="text-center mt-4 text-sm">
                    {expectedRole === 'GRO' ? <Link to="/citizen-login" className="text-blue-600">Citizen login</Link> : <>No account? <Link to="/register" className="text-blue-600">Register</Link> | <Link to="/gro-login" className="text-blue-600">GRO login</Link></>}
                </p>
            </form>
        </div>
    );
}