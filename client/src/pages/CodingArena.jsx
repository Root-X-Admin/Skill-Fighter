import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { jwtDecode } from 'jwt-decode';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { python } from '@codemirror/lang-python';

const socket = io('http://localhost:5000');

export default function CodingArena() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // ✅ track user only when token is valid
    const [roomId, setRoomId] = useState('');
    const [opponent, setOpponent] = useState(null);
    const [question, setQuestion] = useState('');
    const [timer, setTimer] = useState(600);
    const [battleStarted, setBattleStarted] = useState(false);
    const timerRef = useRef(null);
    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('python');
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [opponentSubmission, setOpponentSubmission] = useState(null);
    const [myResult, setMyResult] = useState(null);
    const [actualOutput, setActualOutput] = useState('');
    const [expectedOutput, setExpectedOutput] = useState('');
    const [inputExample, setInputExample] = useState('');
    const [customInput, setCustomInput] = useState('');
    const [stderr, setStderr] = useState('');
    const [compileOutput, setCompileOutput] = useState('');
    const [verdict, setVerdict] = useState('');
    const startTimeRef = useRef(null);



    // ✅ Decode token safely on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Authentication required! Redirecting...');
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            setUser(decoded);
        } catch (err) {
            toast.error('Invalid token. Please login again.');
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [navigate]);

    // ✅ Main matchmaking logic (only runs after user is set)
    useEffect(() => {
        if (!user) return;

        socket.emit('joinCodingArena', user.username);

        socket.on('waitingForOpponent', () => {
            toast.loading('Waiting for opponent...');
        });

        socket.on('codingMatchFound', ({ roomId, opponent, problem, startTime }) => {
            toast.dismiss();
            toast.success(`Matched with ${opponent}`);
            setRoomId(roomId);
            setOpponent(opponent);
            setQuestion(problem.description);
            setInputExample(problem.input);
            setExpectedOutput(problem.expectedOutput);
            setBattleStarted(true);

            startTimeRef.current = startTime;

            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const remaining = 600 - elapsed;
                setTimer(Math.max(0, remaining));

                if (remaining <= 0) {
                    clearInterval(timerRef.current);
                    toast('⏳ Time’s up! Submitting...');
                    handleSubmit();
                }
            }, 1000);
        });


        socket.on('opponentSubmitted', (submission) => {
            setOpponentSubmission(submission);
            toast(`${submission.username} submitted code.`);
        });

        socket.on('yourSubmissionResult', (result) => {
            setMyResult(result);
        });

        return () => {
            socket.off('waitingForOpponent');
            socket.off('codingMatchFound');
            socket.off('opponentSubmitted');
            socket.off('yourSubmissionResult');
            clearInterval(timerRef.current);
        };
    }, [user]);

    const handleSubmit = () => {
        if (hasSubmitted || !user) return;
        clearInterval(timerRef.current);

        const submission = {
            username: user.username,
            code,
            language,
        };

        socket.emit('submitCode', { roomId, submission });
        setHasSubmitted(true);
        toast.success('✅ Code submitted!');
    };

    const languageExtensions = {
        python: python(),
        java: java(),
        cpp: cpp(),
    };

    const languageOptions = [
        { label: 'Python', value: 'python' },
        { label: 'Java', value: 'java' },
        { label: 'C++', value: 'cpp' },
    ];

    const handleRunCode = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language,
                    code,
                    input: customInput, // ✅ changed from stdin to input
                }),
            });

            const data = await res.json();
            setActualOutput(data.output || '');
            setStderr(data.stderr || '');
            setCompileOutput(data.compile_output || '');
            setVerdict(data.status?.description || 'Unknown');
            toast.success('Code executed!');
        } catch (err) {
            toast.error('Failed to run code.');
            setActualOutput('');
            setStderr('Client error while running');
            setCompileOutput('');
            setVerdict('Error');
        }
    };


    const determineWinner = () => {
        if (!myResult || !opponentSubmission) return null;

        if (myResult.verdict === '✅ Correct' && opponentSubmission.verdict !== '✅ Correct') {
            return '🏆 You Win!';
        }
        if (myResult.verdict !== '✅ Correct' && opponentSubmission.verdict === '✅ Correct') {
            return '❌ You Lose!';
        }
        if (myResult.verdict === '✅ Correct' && opponentSubmission.verdict === '✅ Correct') {
            // Compare time and memory
            const myTime = parseFloat(myResult.time || '1000');
            const oppTime = parseFloat(opponentSubmission.time || '1000');
            const myMem = parseFloat(myResult.memory || '100000');
            const oppMem = parseFloat(opponentSubmission.memory || '100000');

            if (myTime < oppTime) return '🏆 You Win (Faster)';
            if (myTime > oppTime) return '❌ You Lose (Slower)';
            if (myMem < oppMem) return '🏆 You Win (More Efficient)';
            if (myMem > oppMem) return '❌ You Lose (Less Efficient)';
            return '🤝 Tie';
        }

        return '🤝 Tie';
    };


    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#0b0b0b] text-white px-6 py-8">
            <Toaster />
            {!battleStarted ? (
                <h2 className="text-xl text-gray-300 text-center">Matching you with another coder...</h2>
            ) : (
                <>
                    <h1 className="text-2xl font-bold text-neonGreen text-center mb-6">
                        ⚔️ Coding Battle vs {opponent}
                    </h1>
                    <p className="text-center text-gray-400 mb-8">
                        ⏳ Time Left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                        {/* 🧠 Problem Side */}
                        <div className="bg-[#1a1a1a] p-6 rounded shadow border border-gray-700">
                            <h2 className="text-2xl font-bold text-neonGreen mb-3">🧠 Problem</h2>
                            <p className="text-gray-200 whitespace-pre-line mb-4">{question}</p>

                            <div className="mt-4 text-sm text-gray-400">
                                <p>
                                    <span className="font-bold text-white">Input:</span> {inputExample}
                                </p>
                                <p>
                                    <span className="font-bold text-white">Expected Output:</span> {expectedOutput}
                                </p>
                            </div>
                        </div>

                        {/* 💻 Code Editor + Controls */}
                        <div className="flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-gray-300">🧪 Select Language:</label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    className="bg-[#1a1a1a] text-white border border-gray-600 px-3 py-1 rounded"
                                >
                                    {languageOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <CodeMirror
                                value={code}
                                height="300px"
                                theme="dark"
                                extensions={[languageExtensions[language]]}
                                onChange={(value) => setCode(value)}
                                className="rounded border border-blue-600 bg-[#101010] text-sm"
                            />

                            <div className="flex justify-between gap-4">
                                <button
                                    onClick={handleRunCode}
                                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded transition"
                                >
                                    ▶️ Run Code
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={hasSubmitted}
                                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition"
                                >
                                    ✅ Submit Code
                                </button>
                            </div>

                            {/* 🧾 Run Code Panel */}
                            {/* 🧾 Output Panel like LeetCode */}
                            <div className="bg-[#111] mt-4 p-4 rounded border border-gray-600 text-sm space-y-3">
                                <h4 className="font-bold text-white">🧾 Output Summary</h4>

                                {verdict && (
                                    <div className="text-sm text-white">
                                        <span className="text-gray-400 mr-2">Verdict:</span>
                                        <span
                                            className={
                                                verdict === 'Accepted'
                                                    ? 'text-green-400'
                                                    : verdict === 'Wrong Answer'
                                                        ? 'text-red-400'
                                                        : 'text-yellow-300'
                                            }
                                        >
                                            {verdict}
                                        </span>
                                    </div>
                                )}

                                {actualOutput && (
                                    <div>
                                        <p className="text-gray-400 mb-1">✅ Output:</p>
                                        <pre className="bg-[#1b1b1b] p-3 rounded border border-green-600 text-green-400 whitespace-pre-wrap">
                                            {actualOutput}
                                        </pre>
                                    </div>
                                )}

                                {stderr && (
                                    <div>
                                        <p className="text-gray-400 mb-1">❌ Runtime Error:</p>
                                        <pre className="bg-[#1b1b1b] p-3 rounded border border-red-600 text-red-400 whitespace-pre-wrap">
                                            {stderr}
                                        </pre>
                                    </div>
                                )}

                                {compileOutput && (
                                    <div>
                                        <p className="text-gray-400 mb-1">⚠️ Compilation Output:</p>
                                        <pre className="bg-[#1b1b1b] p-3 rounded border border-yellow-600 text-yellow-400 whitespace-pre-wrap">
                                            {compileOutput}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 📊 Submission Results After Submit */}
                    {hasSubmitted && (
                        <>
                            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                                <div className="bg-[#1a1a1a] p-4 rounded border border-green-700">
                                    <h3 className="text-green-400 font-bold mb-2">Your Code ({language})</h3>
                                    <pre className="whitespace-pre-wrap text-sm text-white">{code}</pre>
                                    {myResult && (
                                        <div className="mt-4 text-sm text-green-300">
                                            Verdict: {myResult.verdict}
                                            <br />
                                            Time: {myResult.time}s | Memory: {myResult.memory}KB
                                        </div>
                                    )}
                                </div>

                                {opponentSubmission ? (
                                    <div className="bg-[#1a1a1a] p-4 rounded border border-purple-700">
                                        <h3 className="text-purple-400 font-bold mb-2">
                                            {opponentSubmission.username}'s Code ({opponentSubmission.language})
                                        </h3>
                                        <pre className="whitespace-pre-wrap text-sm text-white">
                                            {opponentSubmission.code}
                                        </pre>
                                        <div className="mt-4 text-sm text-purple-300">
                                            Verdict: {opponentSubmission.verdict}
                                            <br />
                                            Time: {opponentSubmission.time}s | Memory: {opponentSubmission.memory}KB
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[#1a1a1a] p-4 rounded border border-gray-700 text-gray-400 text-sm">
                                        Waiting for opponent to submit...
                                    </div>
                                )}
                            </div>

                            {myResult && opponentSubmission && (
                                <div className="mt-6 px-6 py-4 bg-[#1c1c1c] border border-yellow-400 rounded shadow text-center max-w-2xl mx-auto">
                                    <h2 className="text-2xl font-bold text-yellow-300 drop-shadow">{determineWinner()}</h2>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-center gap-6 mt-10">
                        <button
                            onClick={() => window.location.href = '/arena'}
                            className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded shadow-lg hover:scale-105 transition"
                        >
                            🏟️ Return to Arena
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
