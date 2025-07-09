import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const roastLines = [
    "Oh, NOW you want to join?",
    "You've been lurking... afraid much?",
    "Bet you’ll forget your password anyway.",
    "SkillFighter? More like SkillFailure.",
    "It’s okay, not everyone’s built for 1v1s.",
    "Hurry up. Legends don’t hesitate.",
    "Even your email is shaking.",
];

export default function Register() {
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [roastIndex, setRoastIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setRoastIndex((prev) => (prev + 1) % roastLines.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const res = await axios.post('http://localhost:5000/api/register', form);
            localStorage.setItem('token', res.data.token);
            navigate('/');
        } catch (err) {
            alert(err.response?.data?.msg || 'Registration failed');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#0e0e0e] text-white overflow-hidden px-4 font-sans">
            {/* Roast Line */}
            <div className="absolute top-4 text-center text-sm text-pink-400 tracking-wide animate-pulse z-20">
                {roastLines[roastIndex]}
            </div>

            {/* Peer Pressure Lines */}
            <>
                <span className="absolute top-[10%] left-[5%] text-xs text-red-400 animate-fadeSlow">"Still typing? 😂"</span>
                <span className="absolute bottom-[15%] right-[8%] text-xs text-yellow-400 animate-fadeSlow">"We both know you're not ready."</span>
                <span className="absolute top-[45%] right-[2%] text-xs text-cyan-400 animate-fadeSlow">"Need mommy's help?"</span>
            </>

            {/* Registration Form */}
            <form
                onSubmit={handleSubmit}
                className="z-10 bg-gradient-to-br from-[#1f1f1f] to-[#2a2a2a] p-8 rounded-xl shadow-xl w-full max-w-sm border border-neonBlue/40"
            >
                <h2 className="text-3xl font-bold mb-4 text-center text-neonGreen tracking-wide">Join the Arena</h2>

                <input
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    className="w-full mb-3 p-2 rounded bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none"
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    className="w-full mb-3 p-2 rounded bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none"
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className="w-full mb-5 p-2 rounded bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none"
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-2 rounded font-bold transition ${isSubmitting ? 'bg-gray-600' : 'bg-neonBlue hover:scale-105'} text-black`}
                >
                    Enter the Arena 🔥
                </button>
            </form>
        </div>
    );
}
