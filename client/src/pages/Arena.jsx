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
    const inputRef = useRef('');
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
        const typed = inputRef.current.trim();
        const paragraphTrimmed = paragraph.trim();

        const wordCount = typed.length === 0 ? 0 : typed.split(/\s+/).length;
        const accuracy = calculateAccuracy(typed, paragraphTrimmed);

        const resultData = {
            username: user.username,
            wpm: wordCount,
            accuracy: isNaN(accuracy) ? 0 : accuracy,
        };

        setResult(resultData);
        socket.emit('submitResult', { roomId, ...resultData });
    };

    const calculateAccuracy = (typed, actual) => {
        if (!typed || !actual) return 0;

        // Remove punctuation from both strings for fair comparison
        const removePunctuation = (str) => str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
        const cleanTyped = removePunctuation(typed);
        const cleanActual = removePunctuation(actual);

        let correctChars = 0;
        const minLength = Math.min(cleanTyped.length, cleanActual.length);

        // Count correct characters
        for (let i = 0; i < minLength; i++) {
            if (cleanTyped[i] === cleanActual[i]) {
                correctChars++;
            }
        }

        // Calculate accuracy based on character matches
        const accuracy = (correctChars / cleanActual.length) * 100;

        // Ensure accuracy is between 0 and 100
        return Math.min(100, Math.max(0, Math.round(accuracy)));
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
                    <p
                        className="bg-[#1c1c1c] p-4 rounded mb-4 max-w-2xl select-none whitespace-pre-line"
                        onContextMenu={(e) => e.preventDefault()}
                    >
                        {paragraph}
                    </p>


                    <textarea
                        value={inputText}
                        onChange={(e) => {
                            setInputText(e.target.value);
                            inputRef.current = e.target.value;
                        }}
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
