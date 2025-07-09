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
        <div className="relative w-full h-screen bg-[#0e0e0e] overflow-hidden text-white font-sans flex items-center justify-center">
            {/* Dynamic background spotlight */}
            <div className="absolute w-[200vw] h-[200vh] -top-[50vh] -left-[50vw] bg-gradient-radial from-[#00f2ff0c] via-[#0fffc150] to-transparent animate-pulseSlow blur-3xl z-0"></div>

            {/* Floating Roast Line */}
            <div className="absolute top-6 text-center text-pink-400 text-sm z-10 animate-fadeIn">
                {roastLines[roastIndex]}
            </div>

            {/* Extra taunt overlays */}
            <span className="absolute text-red-400 text-xs top-[12%] left-[8%] animate-fadeSlow rotate-[-5deg]">"Still typing? 😂"</span>
            <span className="absolute text-yellow-400 text-xs bottom-[12%] right-[8%] animate-fadeSlow rotate-[3deg]">"We both know you're not ready."</span>
            <span className="absolute text-cyan-400 text-xs top-[40%] right-[3%] animate-fadeSlow rotate-[2deg]">"Need mommy's help?"</span>

            {/* Registration Form */}
            <form
                onSubmit={handleSubmit}
                className="relative z-20 w-[90%] max-w-md bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-8 animate-fadeUp animate-floatSlow"
            >

                <h2 className="text-4xl font-extrabold text-center text-neonGreen mb-6 tracking-wider">
                    Enter the Arena
                </h2>

                <input
                    name="username"
                    placeholder="Username"
                    onChange={handleChange}
                    className="w-full mb-4 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    onChange={handleChange}
                    className="w-full mb-4 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                    className="w-full mb-6 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                    required
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg font-bold text-lg tracking-wide text-black shadow-lg transition-all duration-300 
    bg-gradient-to-r from-neonBlue via-pink-500 to-neonGreen 
    bg-[length:200%_200%] bg-[position:0%_50%] animate-gradientShift 
    ${isSubmitting ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 hover:shadow-neon'}`}
                >
                    {isSubmitting ? 'Registering...' : 'Enter the Arena 🔥'}
                </button>



            </form>
        </div>
    );
}
