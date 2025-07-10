import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const tauntMessages = [
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

const cardPositions = [
    { top: '8%', left: '5%' },
    { top: '15%', right: '10%' },
    { top: '30%', left: '12%' },
    { top: '28%', right: '15%' },
    { top: '50%', left: '8%' },
    { top: '52%', right: '10%' },
    { bottom: '20%', left: '20%' },
    { bottom: '18%', right: '20%' },
    { bottom: '10%', left: '42%' },
];

export default function Home() {
    const [user, setUser] = useState(null);
    const [placedMsgs, setPlacedMsgs] = useState([]);
    const [showMainCard, setShowMainCard] = useState(false);
    const [cardVisible, setCardVisible] = useState(false);


    const finalText = "Do you have what it takes to join SkillFighter?";

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

    useEffect(() => {
        if (user) return;

        let i = 0;
        const interval = setInterval(() => {
            if (i < tauntMessages.length) {
                const msg = tauntMessages[i];
                const pos = cardPositions[i];
                const id = i;
                setPlacedMsgs((prev) => [...prev, { id, msg, pos, animating: true }]);

                setTimeout(() => {
                    setPlacedMsgs((prev) =>
                        prev.map((m) => (m.id === id ? { ...m, animating: false } : m))
                    );
                }, 100);

                i++;
            } else {
                clearInterval(interval);
                setShowMainCard(true);
                setTimeout(() => setCardVisible(true), 50); // slight delay to allow initial state to apply

            }
        }, 800);

        return () => clearInterval(interval);
    }, [user]);


    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#0e0e0e] text-white font-sans">
            <div className="absolute w-[200vw] h-[200vh] -top-[50vh] -left-[50vw] bg-gradient-radial from-[#00f2ff0c] via-[#0fffc150] to-transparent animate-pulseSlow blur-3xl z-0" />

            {/* Floating Cards with animation from center */}
            {!user &&
                placedMsgs.map(({ id, msg, pos, animating }) => (
                    <div
                        key={id}
                        className={`absolute bg-white/5 backdrop-blur-md text-sm sm:text-base text-cyan-300 border border-white/10 p-4 rounded-xl shadow transition-all duration-700 ease-out animate-floatSlow`}
                        style={{
                            top: animating ? '50%' : pos.top,
                            left: animating ? '50%' : pos.left,
                            right: animating ? undefined : pos.right,
                            bottom: animating ? undefined : pos.bottom,
                            transform: 'translate(-50%, -50%)',
                            opacity: animating ? 0 : 1,
                        }}
                    >
                        {msg}
                    </div>
                ))}

            {/* Main Call-to-Action Card */}
            {!user && showMainCard && (
                <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-10">
                    <div
                        className={`
                        pointer-events-auto w-[90%] max-w-md 
                        bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-8 
                        text-center transform transition-all duration-700 ease-out animate-floatSlow
                        ${cardVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
                    `}
                    >
                        <h1 className="text-2xl sm:text-3xl font-bold text-neonGreen mb-6 tracking-wide min-h-[3rem]">
                            {finalText}
                        </h1>
                        <button
                            onClick={() => window.location.href = "/register"}
                            className={`w-full py-3 rounded-lg font-bold text-lg tracking-wide text-black shadow-lg transition-all duration-300
                            bg-gradient-to-r from-neonBlue via-pink-500 to-neonGreen
                            bg-[length:200%_200%] bg-[position:0%_50%] animate-gradientShift
                            hover:scale-105 hover:shadow-neon`}
                        >
                            Join the Battle ⚔️
                        </button>
                    </div>
                </div>
            )}

            {/* Logged in user */}
            {user && (
                <div className="absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-20 text-center">
                    <h1 className="text-3xl font-bold text-neonGreen mb-3">
                        Welcome back, {user.username}!
                    </h1>
                    <p className="text-cyan-400 text-lg">You're already in the arena.</p>
                </div>
            )}
        </div>
    );

}
