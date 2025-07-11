import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ProfilePicModal from '../components/ProfilePicModal';
import ImageViewModal from '../components/ImageViewModal';
import { Toaster, toast } from 'react-hot-toast';

export default function Profile() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [viewImageModal, setViewImageModal] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [sentFriendReq, setSentFriendReq] = useState(false);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [friends, setFriends] = useState([]);


    const handleFriendRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:5000/api/friends/request/${profile.username}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );


            toast.success(res.data.msg || 'Friend request sent');
            setSentFriendReq(true);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to send friend request');
        }
    };

    const handleChallenge = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:5000/api/challenge/send`,
                { opponentUsername: profile.username },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(res.data.msg || 'Challenge sent!');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to send challenge');
        }
    };


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user/${username}`);
                const profileData = res.data;

                const token = localStorage.getItem('token');
                let isCurrentUser = false;

                if (token) {
                    const decoded = jwtDecode(token);
                    isCurrentUser = profileData._id === decoded.id;
                    setIsOwner(isCurrentUser);

                    // If not owner, check friend status
                    if (!isCurrentUser) {
                        const statusRes = await axios.get(
                            `http://localhost:5000/api/friends/status/${decoded.id}/${profileData._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setIsFriend(statusRes.data.isFriend);
                        setSentFriendReq(statusRes.data.requestSent);
                    } else {
                        // ✅ Fetch incoming requests & friends if owner
                        const [incomingRes, friendsRes] = await Promise.all([
                            axios.get('http://localhost:5000/api/friends/requests/incoming', {
                                headers: { Authorization: `Bearer ${token}` }
                            }),
                            axios.get('http://localhost:5000/api/friends/list', {
                                headers: { Authorization: `Bearer ${token}` }
                            }),
                        ]);

                        setIncomingRequests(incomingRes.data.requests || []);
                        setFriends(friendsRes.data.friends || []);
                    }
                }

                setProfile(profileData);
            } catch (err) {
                console.error(err);
                navigate('/');
            }
        };

        fetchProfile();
    }, [username, navigate]);


    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0b0b0b] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0b0b] text-white px-4">
            <Toaster
                position="top-center"
                containerStyle={{ top: 210, zIndex: 9999 }}
                toastOptions={{
                    duration: 2000,
                    style: {
                        background: '#1c1c1c',
                        color: '#fff',
                        border: '1px solid #2e2e2e',
                        padding: '12px',
                        fontSize: '14px',
                    },
                }}
            />

            <div className="bg-[#1c1c1c] p-6 rounded-xl shadow-[0_0_15px_#00f7ff40] w-full max-w-lg animate-fadeIn">
                <div className="flex flex-col items-center mb-4">
                    <div
                        className="relative group transition-all duration-300"
                        onMouseEnter={() => isOwner && setShowDropdown(true)}
                        onMouseLeave={() => isOwner && setShowDropdown(false)}
                    >
                        {profile.profilePic ? (
                            <img
                                src={`data:image/jpeg;base64,${profile.profilePic}`}
                                alt="Avatar"
                                className="w-20 h-20 rounded-full mb-2 border-2 border-blue-500 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => {
                                    if (isOwner) {
                                        setIsModalOpen(true); // open upload modal if owner
                                    } else {
                                        setViewImageModal(true); // view modal if visitor
                                    }
                                }}

                            />
                        ) : (
                            <div
                                className="w-20 h-20 rounded-full bg-blue-700 flex items-center justify-center text-2xl font-bold mb-2 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => {
                                    if (isOwner) {
                                        setIsModalOpen(true); // open upload modal if owner
                                    } else {
                                        setViewImageModal(true); // view modal if visitor
                                    }
                                }}

                            >
                                {profile.username[0].toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Modals */}
                    <ProfilePicModal
                        open={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={(base64) =>
                            setProfile({ ...profile, profilePic: base64.replace(/^data:image\/[a-z]+;base64,/, '') })
                        }
                    />
                    <ImageViewModal
                        open={viewImageModal}
                        onClose={() => setViewImageModal(false)}
                        src={profile.profilePic}
                    />

                    <h1 className="text-3xl font-bold mt-2 tracking-wide text-blue-400">{profile.username}</h1>
                </div>

                <p className="text-center text-sm text-gray-400 mb-4 italic">SkillFighter Warrior Stats</p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                        <p className="text-lg font-semibold text-white">{profile.stats.wins}</p>
                        <p className="text-sm text-gray-400">Wins</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold text-white">{profile.stats.losses}</p>
                        <p className="text-sm text-gray-400">Losses</p>
                    </div>
                    <div className="text-center col-span-2">
                        <p className="text-lg font-semibold text-white">{profile.stats.skillRating}</p>
                        <p className="text-sm text-gray-400">Skill Rating</p>
                    </div>
                    <div className="text-center col-span-2 mb-4">
                        <div className="flex items-center justify-center gap-3">
                            <span className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-yellow-500 to-red-500 font-bold">
                                {profile.stats.skillRating > 900 ? 'Gold Division' :
                                    profile.stats.skillRating > 600 ? 'Silver Division' :
                                        'Bronze Division'}
                            </span>
                            <span className="text-sm text-gray-400">
                                Top {Math.max(1, 100 - profile.stats.skillRating / 10).toFixed(0)}%
                            </span>
                        </div>
                        <p className="text-md text-gray-400 mt-2">
                            Total Battles: {profile.stats.wins + profile.stats.losses}
                        </p>
                    </div>


                </div>

                {isOwner && (
                    <div className="mt-6 w-full">
                        <h3 className="text-lg font-semibold mb-2 text-blue-400">Edit Profile</h3>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const res = await axios.put(
                                        'http://localhost:5000/api/user/edit',
                                        { username: profile.username, profilePic: profile.profilePic },
                                        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
                                    );
                                    toast.success(res.data.msg || 'Changes saved');
                                } catch (err) {
                                    toast.error(err.response?.data?.msg || 'Something went wrong');
                                }
                            }}
                            className="space-y-4"
                        >
                            <input
                                className="w-full p-2 rounded bg-[#2b2b2b] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                                type="text"
                                value={profile.username}
                                onChange={(e) =>
                                    setProfile({ ...profile, username: e.target.value.trim().slice(0, 15) })
                                }
                                placeholder="Enter username"
                            />

                            <button
                                type="submit"
                                className="w-full py-2 rounded text-white font-semibold 
                bg-gradient-to-r from-blue-600 to-purple-600 
                hover:from-purple-600 hover:to-blue-600 
                transition-all duration-300 ease-in-out transform hover:scale-105 
                shadow-lg shadow-blue-600/20"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}
                {!isOwner && (
                    <div className="flex justify-center gap-4 mt-6">
                        <button
                            onClick={handleFriendRequest}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold transition-all duration-200"
                        >
                            {isFriend ? 'Friends ✓' : sentFriendReq ? 'Request Sent' : 'Add Friend'}
                        </button>

                        <button
                            onClick={handleChallenge}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold transition-all duration-200"
                        >
                            ⚔ Challenge
                        </button>
                    </div>
                )}


            </div>
        </div>
    );

}
