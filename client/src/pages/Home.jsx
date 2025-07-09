import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const messages = [
    "Still think you're the fastest coder?",
    "This isn't Leetcode. This is war.",
    "Got skills? Or just WiFi?",
    "Only legends enter the arena.",
    "1v1 me if you dare.",
    "Step in. Or step back.",
    "Brains. Speed. Precision.",
    "Real devs debug mid-battle.",
    "Join the fight. Show your worth.",
];

function getRandomPosition() {
    const top = Math.floor(Math.random() * 85);
    const left = Math.floor(Math.random() * 85);
    return { top: `${top}%`, left: `${left}%` };
}

export default function Home() {
    const [user, setUser] = useState(null);
    const [visibleMsgs, setVisibleMsgs] = useState([]);
    const [typedText, setTypedText] = useState('');
    const fullText = "Do you have what it takes to join SkillFighter?";

    // Decode token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const decoded = jwtDecode(token);
            setUser(decoded);
        } catch {
            localStorage.removeItem('token');
        }
    }, []);

    // Typing effect
    useEffect(() => {
        if (!user) {
            let i = 0;
            const typing = setInterval(() => {
                setTypedText(fullText.slice(0, i + 1));
                i++;
                if (i === fullText.length) clearInterval(typing);
            }, 50);
            return () => clearInterval(typing);
        }
    }, [user]);

    // Floating taunt messages
    useEffect(() => {
        if (user) return;
        const spawnMessage = () => {
            const msg = messages[Math.floor(Math.random() * messages.length)];
            const id = Date.now();
            const position = getRandomPosition();
            const newMsg = { id, msg, position };
            setVisibleMsgs((prev) => [...prev, newMsg]);
            setTimeout(() => {
                setVisibleMsgs((prev) => prev.filter((m) => m.id !== id));
            }, 4000);
        };
        const interval = setInterval(spawnMessage, 1500);
        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#0e0e0e] overflow-hidden text-white px-4">
            {/* Floating Roast Messages */}
            {!user &&
                visibleMsgs.map(({ id, msg, position }) => (
                    <span
                        key={id}
                        className="absolute text-sm sm:text-base text-cyan-300 font-semibold fade-in-out pointer-events-none"
                        style={{ top: position.top, left: position.left }}
                    >
                        {msg}
                    </span>
                ))}

            {/* Main Card */}
            <div className="relative z-10 max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-8 animate-floatSlow animate-fadeUp text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-neonGreen mb-6 tracking-wide min-h-[3rem]">
                    {typedText}
                </h1>

                {!user ? (
                    <button
                        onClick={() => window.location.href = "/register"}
                        className={`w-full py-3 rounded-lg font-bold text-lg tracking-wide text-black shadow-lg transition-all duration-300
                            bg-gradient-to-r from-neonBlue via-pink-500 to-neonGreen
                            bg-[length:200%_200%] bg-[position:0%_50%] animate-gradientShift
                            hover:scale-105 hover:shadow-neon`}
                    >
                        Join the Battle ⚔️
                    </button>
                ) : (
                    <p className="text-xl text-cyan-400 font-semibold">Welcome back, {user.username}!</p>
                )}
            </div>
        </div>
    );
}
