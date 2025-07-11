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
    const [viewImageModal, setViewImageModal] = useState(false);
    const [isFriend, setIsFriend] = useState(false);
    const [sentFriendReq, setSentFriendReq] = useState(false);
    const [requestFromViewedUser, setRequestFromViewedUser] = useState(false);

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

    const handleAcceptRequest = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                `http://localhost:5000/api/friends/accept/${profile._id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(res.data.msg || 'Friend request accepted');
            setIsFriend(true);
            setRequestFromViewedUser(false);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to accept request');
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
                if (token) {
                    const decoded = jwtDecode(token);
                    const isCurrentUser = profileData._id === decoded.id;
                    setIsOwner(isCurrentUser);

                    if (!isCurrentUser) {
                        const statusRes = await axios.get(
                            `http://localhost:5000/api/friends/status/${decoded.id}/${profileData._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setIsFriend(statusRes.data.isFriend);
                        setSentFriendReq(statusRes.data.requestSent);
                        setRequestFromViewedUser(statusRes.data.requestReceived);
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
            <Toaster position="top-center" />

            <div className="bg-[#1c1c1c] p-6 rounded-xl shadow-[0_0_15px_#00f7ff40] w-full max-w-lg">
                <div className="flex flex-col items-center mb-4">
                    <div className="relative group">
                        {profile.profilePic ? (
                            <img
                                src={`data:image/jpeg;base64,${profile.profilePic}`}
                                alt="Avatar"
                                className="w-20 h-20 rounded-full mb-2 border-2 border-blue-500 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() =>
                                    isOwner ? setIsModalOpen(true) : setViewImageModal(true)
                                }
                            />
                        ) : (
                            <div
                                className="w-20 h-20 rounded-full bg-blue-700 flex items-center justify-center text-2xl font-bold mb-2 cursor-pointer hover:scale-105 transition-transform"
                                onClick={() =>
                                    isOwner ? setIsModalOpen(true) : setViewImageModal(true)
                                }
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
                            setProfile({
                                ...profile,
                                profilePic: base64.replace(/^data:image\/[a-z]+;base64,/, ''),
                            })
                        }
                    />
                    <ImageViewModal
                        open={viewImageModal}
                        onClose={() => setViewImageModal(false)}
                        src={profile.profilePic}
                    />

                    <h1 className="text-3xl font-bold mt-2 tracking-wide text-blue-400">
                        {profile.username}
                    </h1>
                </div>

                <p className="text-center text-sm text-gray-400 mb-4 italic">
                    SkillFighter Warrior Stats
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                        <p className="text-lg font-semibold">{profile.stats.wins}</p>
                        <p className="text-sm text-gray-400">Wins</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-semibold">{profile.stats.losses}</p>
                        <p className="text-sm text-gray-400">Losses</p>
                    </div>
                    <div className="col-span-2 text-center">
                        <p className="text-lg font-semibold">{profile.stats.skillRating}</p>
                        <p className="text-sm text-gray-400">Skill Rating</p>
                    </div>
                    <div className="col-span-2 text-center">
                        <span className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-yellow-500 to-red-500 font-bold">
                            {profile.stats.skillRating > 900
                                ? 'Gold Division'
                                : profile.stats.skillRating > 600
                                ? 'Silver Division'
                                : 'Bronze Division'}
                        </span>
                        <p className="text-sm mt-2 text-gray-400">
                            Total Battles: {profile.stats.wins + profile.stats.losses}
                        </p>
                    </div>
                </div>

                {isOwner && (
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                const res = await axios.put(
                                    'http://localhost:5000/api/user/edit',
                                    {
                                        username: profile.username,
                                        profilePic: profile.profilePic,
                                    },
                                    {
                                        headers: {
                                            Authorization: 'Bearer ' + localStorage.getItem('token'),
                                        },
                                    }
                                );
                                toast.success(res.data.msg || 'Changes saved');
                            } catch (err) {
                                toast.error(err.response?.data?.msg || 'Something went wrong');
                            }
                        }}
                        className="mt-6 space-y-4"
                    >
                        <input
                            className="w-full p-2 rounded bg-[#2b2b2b] text-white border border-gray-700"
                            type="text"
                            value={profile.username}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    username: e.target.value.trim().slice(0, 15),
                                })
                            }
                            placeholder="Enter username"
                        />
                        <button
                            type="submit"
                            className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 transition"
                        >
                            Save Changes
                        </button>
                    </form>
                )}

                {!isOwner && (
                    <div className="flex justify-center gap-4 mt-6">
                        {isFriend ? (
                            <button className="bg-green-700 px-4 py-2 rounded text-sm font-semibold">
                                Friends ✓
                            </button>
                        ) : requestFromViewedUser ? (
                            <button
                                onClick={handleAcceptRequest}
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold"
                            >
                                Accept Request
                            </button>
                        ) : sentFriendReq ? (
                            <button className="bg-gray-700 px-4 py-2 rounded text-sm font-semibold">
                                Request Sent
                            </button>
                        ) : (
                            <button
                                onClick={handleFriendRequest}
                                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-semibold"
                            >
                                Add Friend
                            </button>
                        )}

                        <button
                            onClick={handleChallenge}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
                        >
                            ⚔ Challenge
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
