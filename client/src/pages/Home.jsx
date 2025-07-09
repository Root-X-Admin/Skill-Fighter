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
    const top = Math.floor(Math.random() * 80); // % from top
    const left = Math.floor(Math.random() * 80); // % from left
    return { top: `${top}%`, left: `${left}%` };
}

export default function Home() {
    const [user, setUser] = useState(null);
    const [visibleMsgs, setVisibleMsgs] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const decoded = jwtDecode(token);
            setUser(decoded);
        } catch (err) {
            localStorage.removeItem('token');
        }
    }, []);

    useEffect(() => {
        if (user) return;

        const spawnMessage = () => {
            const msg = messages[Math.floor(Math.random() * messages.length)];
            const id = Date.now();
            const position = getRandomPosition();
            const newMsg = { id, msg, position };

            setVisibleMsgs((prev) => [...prev, newMsg]);

            // Remove after 4s
            setTimeout(() => {
                setVisibleMsgs((prev) => prev.filter((m) => m.id !== id));
            }, 4000);
        };

        const interval = setInterval(spawnMessage, 1500);
        return () => clearInterval(interval);
    }, [user]);

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#0e0e0e] text-white overflow-hidden">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-white tracking-wide z-10">
                SkillFighter
            </h1>

            {user ? (
                <p className="text-xl z-10">
                    Logged in as: <strong className="text-cyan-400">{user.username}</strong>
                </p>
            ) : (
                <button
                    onClick={() => window.location.href = "/register"}
                    className="z-10 mt-6 px-6 py-3 bg-cyan-400 text-black font-bold text-lg rounded hover:scale-105 transition"
                >
                    Join the Battle
                </button>
            )}

            {/* Floating Messages */}
            {!user &&
                visibleMsgs.map(({ id, msg, position }) => (
                    <span
                        key={id}
                        className="absolute text-sm sm:text-lg text-cyan-300 font-semibold fade-in-out pointer-events-none"
                        style={{ top: position.top, left: position.left }}
                    >
                        {msg}
                    </span>
                ))}
        </div>
    );
}
