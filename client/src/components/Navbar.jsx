import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Sync token/user info across tabs and after login/register without refresh
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

        // Listen to changes in localStorage (login/logout from other tabs)
        window.addEventListener('storage', updateUser);

        // Optional: run updateUser again on navigation or route change
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
        <nav className="sticky top-0 z-50 flex justify-between items-center px-6 py-4 bg-darkGray text-neonBlue border-b border-neonBlue shadow-lg">
            <Link
                to="/"
                className="text-2xl font-bold tracking-wide text-neonGreen glow hover:text-neonBlue transition"
            >
                SkillFighter
            </Link>

            <div className="flex gap-4 items-center">
                {!user ? (
                    <>
                        <Link to="/login" className="hover:text-neonGreen transition">Login</Link>
                        <Link to="/register" className="hover:text-neonGreen transition">Register</Link>
                    </>
                ) : (
                    <>
                        <div
                            title={user.username}
                            className="w-9 h-9 bg-neonGreen text-darkGray rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:scale-105 transition"
                        >
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-neonBlue text-black px-3 py-1 rounded hover:scale-105 transition shadow-md font-semibold"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
