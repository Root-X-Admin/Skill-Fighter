// client/src/pages/Arena.jsx

import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

const socket = io('http://localhost:5000');

export default function Arena() {
    const [paragraph, setParagraph] = useState('');
    const [started, setStarted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [inputText, setInputText] = useState('');
    const [opponentResult, setOpponentResult] = useState(null);
    const [result, setResult] = useState(null);
    const [roomId, setRoomId] = useState(null);
    const intervalRef = useRef(null);

    const token = localStorage.getItem('token');
    const user = token ? jwtDecode(token) : null;

    const handleStartBattle = () => {
        if (!user) {
            toast.error('Please log in first');
            return;
        }
        socket.emit('joinArena', user.username);
        toast.loading('Searching for opponent...');
    };

    useEffect(() => {
        socket.on('waitingForOpponent', () => {
            toast.loading('Waiting for opponent...');
        });

        socket.on('matchFound', ({ roomId, players, paragraph }) => {
            toast.dismiss();
            setRoomId(roomId);
            setParagraph(paragraph);
            setStarted(true);
            setTimeLeft(60);
            setInputText('');

            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        evaluateResult();
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
            socket.off('matchFound');
            socket.off('waitingForOpponent');
            socket.off('opponentResult');
        };
    }, []);

    const evaluateResult = () => {
        const wordsTyped = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;
        const accuracy = calculateAccuracy(inputText, paragraph);
        const result = { username: user.username, accuracy, wpm: wordsTyped };

        setResult(result);
        socket.emit('submitResult', { roomId, ...result });
    };

    const calculateAccuracy = (typed, actual) => {
        if (actual.length === 0) return 0;
        let correct = 0;
        for (let i = 0; i < typed.length && i < actual.length; i++) {
            if (typed[i] === actual[i]) correct++;
        }
        return Math.round((correct / actual.length) * 100);
    };

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white flex flex-col items-center justify-center px-4">
            <Toaster />
            {!started ? (
                <button onClick={handleStartBattle} className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-lg font-bold">
                    Start 1v1 Typing Battle
                </button>
            ) : (
                <>
                    <h2 className="text-xl font-bold text-green-400 mb-4">Time Left: {timeLeft}s</h2>
                    <p className="bg-[#1c1c1c] p-4 rounded mb-4 max-w-2xl leading-relaxed whitespace-pre-line">{paragraph}</p>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="w-full max-w-2xl h-40 p-4 rounded bg-[#111] border-2 border-blue-500"
                        disabled={timeLeft === 0}
                        placeholder="Start typing here..."
                    />
                    {result && (
                        <div className="mt-4 text-center space-y-2">
                            <p>✅ You typed: <strong>{result.wpm} WPM</strong></p>
                            <p>🎯 Accuracy: <strong>{result.accuracy}%</strong></p>
                            {opponentResult && (
                                <>
                                    <p>🧍 Opponent typed: <strong>{opponentResult.wpm} WPM</strong></p>
                                    <p>🎯 Opponent accuracy: <strong>{opponentResult.accuracy}%</strong></p>
                                    <p className="text-xl font-bold mt-2 text-yellow-400">
                                        {result.wpm > opponentResult.wpm
                                            ? '🏆 You win!'
                                            : result.wpm < opponentResult.wpm
                                                ? '❌ You lose!'
                                                : '🤝 It’s a tie!'}
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
