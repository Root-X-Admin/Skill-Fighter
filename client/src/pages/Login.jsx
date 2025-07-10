import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';


export default function Login() {
    const [form, setForm] = useState({ identifier: '', password: '' });
    const [forgotStep, setForgotStep] = useState(0); // 0 = normal login
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const res = await axios.post('http://localhost:5000/api/login', form);
            localStorage.setItem('token', res.data.token);
            toast.success('Arena access granted 💥');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            const msg = err.response?.data?.msg || 'Login failed ⚠️';
            toast.error(msg);
            setIsSubmitting(false);
        }
    };

    const handleSendOtp = async () => {
        if (!email) return toast.error('Enter your email first!');
        setIsSendingOtp(true);
        try {
            await axios.post('http://localhost:5000/api/send-otp', { email });
            toast.success('OTP sent 📩');
            setForgotStep(2);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Failed to send OTP');
            setIsSendingOtp(false); // 🔄 re-enable if failed
        }
    };


    const handleVerifyOtp = async () => {
        if (!otp) return toast.error('Enter OTP!');
        try {
            await axios.post('http://localhost:5000/api/verify-otp', { email, otp });
            toast.success('OTP verified ✅');
            setForgotStep(3);
        } catch (err) {
            toast.error(err.response?.data?.msg || 'OTP verification failed');
        }
    };

    const handleResetPassword = async () => {
        if (newPass.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }
        if (newPass !== confirmPass) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/reset-password', {
                email,
                newPassword: newPass,
            });
            toast.success('Password updated 🔒');
            setForgotStep(0);
            setForm({ identifier: '', password: '' });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Reset failed');
        }
    };


    return (
        <div className="relative flex items-center justify-center min-h-screen bg-[#0e0e0e] text-white overflow-hidden px-4">
            {/* Floating insults */}
            <span className="absolute top-[10%] left-[8%] text-xs text-red-400 animate-fadeSlow">"Forgot your skills?"</span>
            <span className="absolute bottom-[15%] right-[8%] text-xs text-yellow-400 animate-fadeSlow">"Still trying to remember password?"</span>
            <span className="absolute top-[45%] right-[2%] text-xs text-cyan-400 animate-fadeSlow">"Just login or stay scared."</span>

            <Toaster
                position="top-center"
                containerStyle={{ top: 210, zIndex: 9999 }} // force position
                toastOptions={{
                    duration: 1500,
                    style: {
                        background: '#0e0e0e',
                        color: '#00ffe7',
                        border: '1px solid #00ffe7',
                        boxShadow: '0 0 10px #00ffe7',
                        fontWeight: 'bold',
                    },
                    iconTheme: {
                        primary: '#00ffe7',
                        secondary: '#000',
                    },
                }}
            />

            {/* Glassy Neon Auth Card */}
            <form
                onSubmit={handleLogin}
                className="relative z-20 w-[90%] max-w-md bg-white/5 backdrop-blur-md border border-white/10 shadow-xl rounded-2xl p-8 animate-fadeUp animate-floatSlow"
            >
                <h2 className="text-4xl font-extrabold text-center text-neonGreen mb-6 tracking-wider">
                    {forgotStep === 0 ? 'Welcome Back' :
                        forgotStep === 1 ? 'Forgot Password' :
                            forgotStep === 2 ? 'Enter OTP' : 'Reset Password'}
                </h2>

                {forgotStep === 0 && (
                    <>
                        <input
                            name="identifier"
                            placeholder="Email or Username"
                            className="w-full mb-4 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                            onChange={handleChange}
                            required
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            className="w-full mb-6 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                            onChange={handleChange}
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
                            {isSubmitting ? 'Logging in...' : 'Login to Fight ⚔️'}
                        </button>
                        <p
                            className="text-sm text-cyan-400 text-center mt-4 cursor-pointer hover:underline"
                            onClick={() => {
                                setForgotStep(1);
                                setIsSendingOtp(false);
                                setEmail('');
                            }}

                        >
                            Forgot Password?
                        </p>
                    </>
                )}

                {forgotStep === 1 && (
                    <>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="w-full mb-4 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                            className={`w-full py-3 rounded-lg font-bold text-lg tracking-wide text-black shadow-lg transition-all duration-300 
        bg-gradient-to-r from-neonBlue via-pink-500 to-neonGreen 
        bg-[length:200%_200%] bg-[position:0%_50%] animate-gradientShift 
        ${isSendingOtp ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 hover:shadow-neon'}`}
                        >
                            {isSendingOtp ? 'Sending OTP...' : 'Send OTP'}
                        </button>

                    </>
                )}

                {forgotStep === 2 && (
                    <>
                        <input
                            placeholder="Enter OTP"
                            className="w-full mb-4 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="w-full py-3 rounded-lg font-bold text-lg tracking-wide text-black shadow-lg transition-all duration-300 bg-gradient-to-r from-neonBlue via-pink-500 to-neonGreen bg-[length:200%_200%] bg-[position:0%_50%] animate-gradientShift hover:scale-105 hover:shadow-neon"
                        >
                            Verify OTP
                        </button>
                    </>
                )}

                {forgotStep === 3 && (
                    <>
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full mb-4 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                            onChange={(e) => setNewPass(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full mb-4 p-3 rounded-lg bg-transparent border border-neonGreen text-neonBlue placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neonBlue transition"
                            onChange={(e) => setConfirmPass(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={handleResetPassword}
                            className="w-full py-3 rounded-lg font-bold text-lg tracking-wide text-black shadow-lg transition-all duration-300 bg-gradient-to-r from-neonBlue via-pink-500 to-neonGreen bg-[length:200%_200%] bg-[position:0%_50%] animate-gradientShift hover:scale-105 hover:shadow-neon"
                        >
                            Update Password
                        </button>
                    </>
                )}
            </form>
        </div>
    );
}
