import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { Toaster, toast } from 'react-hot-toast';

const socket = io('http://localhost:5000');

export default function Arena() {
    const [paragraph, setParagraph] = useState('');
    const [roomId, setRoomId] = useState('');
    const [input, setInput] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [started, setStarted] = useState(false);
    const [mistakes, setMistakes] = useState(0);
    const [correct, setCorrect] = useState(0);
    const [finalResult, setFinalResult] = useState(null);
    const [opponentResult, setOpponentResult] = useState(null);
    const [wpmData, setWpmData] = useState([]);
    const [isMatching, setIsMatching] = useState(false);
    const [matchToastId, setMatchToastId] = useState(null);


    const decoded = jwtDecode(localStorage.getItem('token'));
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const startBattle = () => {
        setIsMatching(true);

        // Show toast with Cancel button
        const toastId = toast.loading(
            t => (
                <div className="flex items-center justify-between gap-4">
                    <span>Searching for opponent...</span>
                    <button
                        className="text-red-400 hover:text-red-600 font-bold"
                        onClick={() => {
                            socket.emit('cancelMatch');
                            setIsMatching(false);
                            setRoomId('');
                            toast.dismiss(toastId);
                        }}
                    >
                        ✖
                    </button>
                </div>
            ),
            { duration: Infinity }
        );

        setMatchToastId(toastId);

        socket.emit('joinArena', decoded.username);
    };


    useEffect(() => {
        socket.on('waitingForOpponent', () => toast.loading('Waiting for opponent...'));

        socket.on('matchFound', ({ roomId, paragraph }) => {
            toast.dismiss();
            toast.success('Match found!');
            setIsMatching(false);
            setRoomId(roomId);
            setParagraph(paragraph);
            setInput('');
            setMistakes(0);
            setCorrect(0);
            setFinalResult(null);
            setOpponentResult(null);
            setWpmData([]);
            setStarted(true);
            setTimeLeft(60);
            startTimeRef.current = Date.now();

            // Start timer
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const remaining = 60 - elapsed;

                if (remaining <= 0) {
                    clearInterval(timerRef.current);
                    setTimeLeft(0);
                } else {
                    setTimeLeft(remaining);
                }
            }, 1000);
        });

        socket.on('opponentResult', (res) => {
            setOpponentResult(res);
        });

        return () => {
            socket.off('waitingForOpponent');
            socket.off('matchFound');
            socket.off('opponentResult');
            clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (started && timeLeft === 0) {
            const duration = (Date.now() - startTimeRef.current) / 60000;
            const wpm = Math.round((correct / 5) / duration);
            const accuracy = input.length ? Math.round((correct / input.length) * 100) : 0;

            const result = {
                username: decoded.username,
                wpm,
                accuracy,
                mistakes,
            };

            setFinalResult(result);
            socket.emit('submitResult', { roomId, result });
        }
    }, [timeLeft, started]);

    const handleTyping = (e) => {
        const typed = e.target.value;
        const paraSlice = paragraph.slice(0, typed.length);

        let localCorrect = 0;
        let localMistakes = 0;

        for (let i = 0; i < typed.length; i++) {
            if (typed[i] === paraSlice[i]) localCorrect++;
            else localMistakes++;
        }

        setInput(typed);
        setCorrect(localCorrect);
        setMistakes(localMistakes);
    };

    const renderParagraph = () => {
        return paragraph.split('').map((char, idx) => {
            const isTyped = idx < input.length;
            const isCorrect = input[idx] === char;

            return (
                <span
                    key={idx}
                    className={
                        isTyped
                            ? isCorrect
                                ? 'text-green-400'
                                : 'text-red-500'
                            : 'text-gray-400'
                    }
                >
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="w-full min-h-screen max-h-screen overflow-y-auto bg-[#0b0b0b] text-white px-4 py-10">
            <Toaster />
            {!roomId ? (
                <div className="w-full h-[70vh] flex items-center justify-center">
                    <button
                        onClick={startBattle}
                        className="px-10 py-4 rounded-lg text-xl font-bold tracking-wide transition-all duration-300
        bg-gradient-to-br from-[#00ffe7] via-[#ff00ff] to-[#00ff99]
        text-black shadow-[0_0_15px_#00ffe7] hover:shadow-[0_0_30px_#ff00ff]
        hover:scale-105 animate-fadeUp"
                    >
                        Start Typing Duel ⚔
                    </button>
                </div>

            ) : (
                <div className="max-w-5xl mx-auto flex flex-col items-center justify-start gap-10">
                    <h2 className="text-2xl font-bold text-center text-neonGreen drop-shadow-md">
                        ⏱ Time Left: {timeLeft}s
                    </h2>

                    <div className="bg-[#111111] p-6 rounded-xl border border-neonGreen/30 shadow-lg text-justify text-gray-300 tracking-wide leading-relaxed font-mono text-lg overflow-auto max-h-[300px] custom-scroll">
                        {renderParagraph()}
                    </div>

                    <textarea
                        value={input}
                        onChange={handleTyping}
                        disabled={timeLeft === 0}
                        className="w-full p-5 h-40 rounded-xl bg-[#0d0d0d] text-neonBlue font-medium 
                    border-2 border-neonBlue focus:outline-none focus:ring focus:ring-neonGreen 
                    placeholder:text-gray-500 shadow-md"
                        placeholder="🔥 Type here to prove your speed..."
                    ></textarea>

                    <div className="text-center text-base text-neonGreen tracking-wider">
                        Live WPM: <span className="font-bold">{Math.round((correct / 5) / ((Date.now() - startTimeRef.current || 1) / 60000)) || 0}</span> •
                        Accuracy: <span className="font-bold">{input.length ? Math.round((correct / input.length) * 100) : 0}%</span>
                    </div>

                    {finalResult && (
                        <div className="text-center bg-[#121212] mb-20 p-6 rounded-xl border border-neonBlue/40 shadow-xl">
                            <h3 className="text-xl font-bold text-neonBlue mb-3">🔥 Your Final Result</h3>
                            <p className="text-neonGreen">WPM: {finalResult.wpm}</p>
                            <p className="text-yellow-400">Accuracy: {finalResult.accuracy}%</p>
                            <p className="text-red-400">Mistakes: {finalResult.mistakes}</p>

                            {opponentResult && (
                                <div className="mt-6 border-t border-white/10 pt-4">
                                    <h3 className="text-lg font-semibold text-purple-400 mb-2">
                                        🧍 Opponent: {opponentResult.username}
                                    </h3>
                                    <p>WPM: {opponentResult.wpm}</p>
                                    <p>Accuracy: {opponentResult.accuracy}%</p>
                                    <p>Mistakes: {opponentResult.mistakes}</p>

                                    <h2 className="text-3xl mt-4 font-extrabold text-yellow-300 drop-shadow-md">
                                        {finalResult.wpm > opponentResult.wpm
                                            ? '🏆 You Win!'
                                            : finalResult.wpm < opponentResult.wpm
                                                ? '❌ You Lose!'
                                                : finalResult.accuracy > opponentResult.accuracy
                                                    ? '🏆 You Win (More Accurate)!'
                                                    : finalResult.accuracy < opponentResult.accuracy
                                                        ? '❌ You Lose (Less Accurate)!'
                                                        : '🤝 It’s a Tie!'}
                                    </h2>
                                </div>
                            )}

                            {/* 🧭 Post-battle options */}
                            <div className="flex justify-center gap-6 mt-8">

                                <button
                                    onClick={() => window.location.href = '/arena'}
                                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded shadow-lg hover:scale-105 transition"
                                >
                                    🏟️ Return to Arena
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );

}
