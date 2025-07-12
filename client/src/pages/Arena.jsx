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
    const decoded = jwtDecode(localStorage.getItem('token'));
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);

    const startBattle = () => {
        socket.emit('joinArena', decoded.username);
        toast.loading('Matching...');
    };

    useEffect(() => {
        socket.on('waitingForOpponent', () => {
            toast.loading('Waiting for opponent...');
        });

        socket.on('matchFound', ({ roomId, paragraph }) => {
            toast.dismiss();
            toast.success('Match found!');
            setRoomId(roomId);
            setParagraph(paragraph);
            setInput('');
            setMistakes(0);
            setCorrect(0);
            setFinalResult(null);
            setOpponentResult(null);
            setStarted(true);
            startTimeRef.current = Date.now();
            setTimeLeft(60);

            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        });

        socket.on('opponentResult', (res) => {
            setOpponentResult(res);
        });

        return () => {
            socket.off('waitingForOpponent');
            socket.off('matchFound');
            socket.off('opponentResult');
        };
    }, []);

    // ⏳ When time runs out, calculate results
    useEffect(() => {
        if (started && timeLeft === 0) {
            const duration = (Date.now() - startTimeRef.current) / 60000; // in minutes
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
    }, [timeLeft]);

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

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center px-4 py-8">
            <Toaster />
            {!started ? (
                <button
                    onClick={startBattle}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 px-8 py-3 rounded text-lg font-bold shadow-md animate-floatSlow"
                >
                    Start Typing Battle ⚔️
                </button>
            ) : (
                <div className="w-full max-w-4xl flex flex-col gap-6">
                    <h2 className="text-xl font-semibold text-green-400 text-center">⏱ Time Left: {timeLeft}s</h2>
                    <div className="bg-[#1a1a1a] p-4 rounded text-gray-300 text-justify leading-relaxed">{paragraph}</div>
                    <textarea
                        value={input}
                        onChange={handleTyping}
                        disabled={timeLeft === 0}
                        className="w-full p-4 h-40 bg-[#111] text-white border-2 border-blue-500 rounded focus:outline-none placeholder:text-gray-500"
                        placeholder="Start typing here..."
                    ></textarea>

                    {finalResult && (
                        <div className="text-center mt-6">
                            <h3 className="text-lg font-bold text-blue-400 mb-2">🔥 Your Result</h3>
                            <p>WPM: {finalResult.wpm}</p>
                            <p>Accuracy: {finalResult.accuracy}%</p>
                            <p>Mistakes: {finalResult.mistakes}</p>

                            {opponentResult && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-purple-400 mb-1">
                                        🧍 Opponent: {opponentResult.username}
                                    </h3>
                                    <p>WPM: {opponentResult.wpm}</p>
                                    <p>Accuracy: {opponentResult.accuracy}%</p>
                                    <p>Mistakes: {opponentResult.mistakes}</p>

                                    <h2 className="text-2xl mt-4 font-extrabold text-yellow-300">
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
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
