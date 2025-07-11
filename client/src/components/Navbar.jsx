import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const navigate = useNavigate();

    const notificationRef = useRef(null);
    const dropdownRef = useRef(null);
    const dropdownTimer = useRef(null);

    // ⛔️ Close both dropdowns on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (
                notificationRef.current && !notificationRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) {
                setShowNotifications(false);
                setDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 🔄 Fetch user & notifications
    useEffect(() => {
        const updateUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return setUser(null);

            try {
                const decoded = jwtDecode(token);
                setUser(decoded);

                const res = await axios.get('http://localhost:5000/api/friends/requests/incoming', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setNotifications(res.data.requests || []);
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            }
        };

        updateUser();
        const interval = setInterval(updateUser, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    return (
        <nav className="z-50 flex justify-between items-center px-6 py-4 bg-[#0b0b0b]/90 backdrop-blur border-b border-neonBlue shadow-md relative">
            {/* 🔥 Brand Name */}
            <Link
                to="/"
                className="text-2xl font-extrabold tracking-wider bg-gradient-to-r from-neonBlue via-pink-500 to-neonGreen bg-clip-text text-transparent animate-gradientShift"
            >
                SkillFighter
            </Link>

            <div className="flex gap-6 items-center text-sm sm:text-base font-semibold relative">
                {!user ? (
                    <>
                        <Link to="/login" className="text-neonBlue hover:text-neonGreen transition">Login</Link>
                        <Link to="/register" className="text-neonBlue hover:text-neonGreen transition">Register</Link>
                    </>
                ) : (
                    <>
                        {/* 🔔 Notification Bell */}
                        <div
                            ref={notificationRef}
                            className="relative cursor-pointer"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <span className="text-white text-xl">🔔</span>
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            )}
                            {showNotifications && (
                                <div className="absolute right-1 top-10 bg-[#1c1c1c] text-white rounded shadow-md w-64 z-50 border border-gray-700 p-2">
                                    <h4 className="text-sm font-bold mb-2 border-b pb-1 border-gray-600">Notifications</h4>
                                    {notifications.length === 0 ? (
                                        <p className="text-sm text-gray-400">No new notifications</p>
                                    ) : (
                                        notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className="text-sm py-1 border-b border-gray-700 last:border-none cursor-pointer hover:bg-blue-700/30"
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                    navigate('/friends?tab=incoming');
                                                }}
                                            >
                                                <span className="text-blue-400">{n.username}</span> sent you a friend request
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 🧍 User Dropdown (Hover-based with delay) */}
                        <div
                            className="relative"
                            ref={dropdownRef}
                            onMouseEnter={() => {
                                clearTimeout(dropdownTimer.current);
                                setDropdownOpen(true);
                            }}
                            onMouseLeave={() => {
                                dropdownTimer.current = setTimeout(() => setDropdownOpen(false), 500);
                            }}
                        >
                            <div
                                className="w-9 h-9 bg-neonGreen text-darkGray rounded-full flex items-center justify-center font-bold text-sm cursor-pointer ring-2 ring-neonBlue hover:scale-105 transition"
                                title={user.username}
                            >
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 bg-[#1c1c1c] border border-gray-700 rounded shadow-md w-40 z-50">
                                    <Link
                                        to={`/${user.username}`}
                                        className="block px-4 py-2 hover:bg-neonBlue/30 text-sm"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Profile
                                    </Link>

                                    <Link
                                        to="/friends"
                                        className="block px-4 py-2 hover:bg-neonBlue/30 text-sm"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        Friends
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 hover:bg-red-600 text-sm"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}
