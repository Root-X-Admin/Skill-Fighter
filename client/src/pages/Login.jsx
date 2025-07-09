import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const res = await axios.post('http://localhost:5000/api/login', form);
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Login failed';
            alert(msg);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#0e0e0e] text-white overflow-hidden px-4">
            {/* Optional Floating Text/Mock Pressure Lines */}
            <span className="absolute top-[10%] left-[8%] text-xs text-red-400 animate-fadeSlow">"Forgot your skills?"</span>
            <span className="absolute bottom-[15%] right-[8%] text-xs text-yellow-400 animate-fadeSlow">"Still trying to remember password?"</span>
            <span className="absolute top-[45%] right-[2%] text-xs text-cyan-400 animate-fadeSlow">"Just login or stay scared."</span>

            {/* Floating Login Form */}
            <form
                onSubmit={handleSubmit}
                className="z-10 bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] p-8 rounded-xl shadow-xl w-full max-w-sm border border-neonBlue/40 animate-floatSlow"
            >
                <h2 className="text-3xl font-bold mb-6 text-center text-neonGreen tracking-wide">Welcome Back</h2>

                <input
                    className="w-full mb-4 p-3 rounded bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue"
                    placeholder="Email"
                    name="email"
                    type="email"
                    onChange={handleChange}
                    required
                />
                <input
                    className="w-full mb-6 p-3 rounded bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue"
                    placeholder="Password"
                    name="password"
                    type="password"
                    onChange={handleChange}
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-bold text-lg tracking-wide text-black shadow-lg transition-all duration-300
                        bg-gradient-to-r from-neonBlue via-pink-500 to-neonGreen
                        bg-[length:200%_200%] bg-[position:0%_50%] animate-gradientShift
                        ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 hover:shadow-neon'}
                    `}
                >
                    {isSubmitting ? 'Logging in...' : 'Login to Fight ⚔️'}
                </button>
            </form>
        </div>
    );
}
