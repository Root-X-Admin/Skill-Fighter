import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const updateUser = () => {
            const token = localStorage.getItem('token');
            if (!token) return setUser(null);

            try {
                const decoded = jwtDecode(token);
                setUser(decoded);
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            }
        };

        updateUser();
        window.addEventListener('storage', updateUser);
        const interval = setInterval(updateUser, 1000);
        return () => {
            window.removeEventListener('storage', updateUser);
            clearInterval(interval);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="z-50 flex justify-between items-center px-6 py-4 bg-[#0b0b0b]/90 backdrop-blur border-b border-neonBlue shadow-md">
            {/* Logo */}
            <Link
                to="/"
                className="text-2xl sm:text-3xl font-extrabold tracking-wide neon-gradient-text"
            >
                SkillFighter
            </Link>

            {/* Links */}
            <div className="flex gap-5 items-center text-sm sm:text-base font-semibold">
                {!user ? (
                    <>
                        <Link
                            to="/login"
                            className="relative text-neonBlue hover:text-neonGreen transition duration-200 group"
                        >
                            Login
                            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-neonGreen group-hover:w-full transition-all duration-300 ease-out"></span>
                        </Link>
                        <Link
                            to="/register"
                            className="relative text-neonBlue hover:text-neonGreen transition duration-200 group"
                        >
                            Register
                            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-neonGreen group-hover:w-full transition-all duration-300 ease-out"></span>
                        </Link>
                    </>
                ) : (
                    <>
                        <div
                            title={user.username}
                            className="w-9 h-9 bg-neonGreen text-darkGray rounded-full flex items-center justify-center font-bold text-sm cursor-pointer ring-2 ring-neonBlue hover:scale-105 transition"
                        >
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-1 rounded bg-gradient-to-r from-neonGreen to-neonBlue text-black font-bold hover:scale-105 transition-all shadow-md"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
