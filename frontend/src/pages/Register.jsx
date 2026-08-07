import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        try {
            const res = await api.post('/api/auth/register', {
                name,
                email,
                phoneNumber,
                password,
                role: 'CITIZEN',
            });
            if (res.data.success) navigate('/login');
            else setErrors([res.data.message]);
        } catch (err) {
            const body = err.response?.data;
            if (body?.data && typeof body.data === 'object') {
                // Field-level validation errors: { fieldName: message }
                setErrors(Object.values(body.data));
            } else {
                setErrors([body?.message || 'Registration failed.']);
            }
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Register Citizen</h2>

                {errors.length > 0 && (
                    <div className="text-red-500 text-sm mb-4">
                        {errors.map((msg, i) => <p key={i}>• {msg}</p>)}
                    </div>
                )}

                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded mb-4" required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border rounded mb-4" required />
                <input type="tel" placeholder="Phone Number (10 digits)" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-2 border rounded mb-4" required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border rounded mb-6" required />
                <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Register</button>
                <p className="text-center mt-4 text-sm">Already registered? <Link to="/login" className="text-blue-600">Login</Link></p>
            </form>
        </div>
    );
}