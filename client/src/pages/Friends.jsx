import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Toaster, toast } from 'react-hot-toast';

export default function Friends() {
    const [tab, setTab] = useState('incoming'); // incoming | sent | friends
    const [incoming, setIncoming] = useState([]);
    const [sent, setSent] = useState([]);
    const [friends, setFriends] = useState([]);
    const [userId, setUserId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const decoded = jwtDecode(token);
                setUserId(decoded.id);

                const headers = { Authorization: `Bearer ${token}` };

                const [incomingRes, sentRes, friendsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/friends/requests/incoming', { headers }),
                    axios.get(`http://localhost:5000/api/friends/sent/${decoded.id}`, { headers }),
                    axios.get('http://localhost:5000/api/friends/list', { headers }),
                ]);

                setIncoming(incomingRes.data.requests || []);
                setSent(sentRes.data.sent || []);
                setFriends(friendsRes.data.friends || []);
            } catch (err) {
                toast.error('Failed to fetch friend data');
            }
        };
        fetchData();
    }, []);

    const deleteFriend = async (friendUsername) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/friends/friends/${friendUsername}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Friend removed');
            setFriends(prev => prev.filter(f => f.username !== friendUsername));
        } catch {
            toast.error('Failed to delete friend');
        }
    };



    const acceptRequest = async (fromId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/api/friends/accept/${fromId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Friend request accepted');
            setIncoming(prev => prev.filter(u => u._id !== fromId));

            // Refresh friend list
            const headers = { Authorization: `Bearer ${token}` };
            const friendsRes = await axios.get('http://localhost:5000/api/friends/list', { headers });
            setFriends(friendsRes.data.friends || []);
        } catch {
            toast.error('Failed to accept request');
        }
    };

    const currentList = tab === 'incoming' ? incoming : tab === 'sent' ? sent : friends;

    return (
        <div className="min-h-screen px-6 py-8 bg-[#0b0b0b] text-white">
            <Toaster />
            <h1 className="text-3xl font-bold mb-6 text-neonBlue">Friends</h1>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700 mb-6">
                {['incoming', 'sent', 'friends'].map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`uppercase text-sm px-3 py-2 border-b-2 font-semibold transition
                            ${tab === t
                                ? 'border-neonGreen text-neonGreen'
                                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'}`}
                    >
                        {t === 'incoming' && 'Incoming Requests'}
                        {t === 'sent' && 'Requests Sent'}
                        {t === 'friends' && 'Your Friends'}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-3">
                {currentList.length === 0 && (
                    <p className="text-gray-500">
                        {tab === 'incoming' && 'No incoming requests'}
                        {tab === 'sent' && 'No requests sent'}
                        {tab === 'friends' && 'You have no friends yet'}
                    </p>
                )}

                {currentList.map(user => (
                    <div
                        key={user._id}
                        onClick={() => navigate(`/${user.username}`)}
                        className="flex items-center justify-between bg-[#1c1c1c] px-4 py-2 rounded hover:bg-[#2c2c2c] cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            {user.profilePic ? (
                                <img
                                    src={`data:image/jpeg;base64,${user.profilePic}`}
                                    alt=""
                                    className="w-8 h-8 rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm font-medium">{user.username}</span>
                        </div>

                        {tab === 'incoming' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click
                                    acceptRequest(user._id);
                                }}
                                className="text-xs bg-green-600 hover:bg-green-700 px-3 py-1 rounded"
                            >
                                Accept
                            </button>
                        )}

                        {tab === 'sent' && (
                            <span className="text-xs text-yellow-400">Pending</span>
                        )}

                        {tab === 'friends' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteFriend(user.username);
                                }}
                                className="text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
