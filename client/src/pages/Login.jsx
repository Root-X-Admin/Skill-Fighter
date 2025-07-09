import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', form);
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Login failed';
            alert(msg);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-darkGray text-white">
            <form
                onSubmit={handleSubmit}
                className="bg-[#1a1a1a] text-white p-6 rounded-xl shadow-xl w-80 border border-neonBlue"
            >
                <h2 className="text-2xl font-bold mb-4 text-neonGreen text-center">Login</h2>

                <input
                    className="w-full mb-3 p-2 rounded bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue"
                    placeholder="Email"
                    name="email"
                    type="email"
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-full mb-5 p-2 rounded bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue"
                    placeholder="Password"
                    name="password"
                    type="password"
                    onChange={handleChange}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-neonBlue text-black font-semibold py-2 rounded hover:scale-105 transition shadow-lg"
                >
                    Login
                </button>
            </form>
        </div>
    );
}
