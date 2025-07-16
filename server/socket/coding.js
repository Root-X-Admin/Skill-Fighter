let waitingCoder = null;
const executeCode = require('../utils/executeCode'); // ✅ Must exist and work
require('dotenv').config();

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🧠 [Coding] Socket connected:', socket.id);

        // 🧩 Matchmaking logic
        socket.on('joinCodingArena', (username) => {
            socket.username = username;

            // ✅ Prevent self-matching
            if (waitingCoder && waitingCoder.username !== socket.username) {
                const opponent = waitingCoder;
                waitingCoder = null;

                const roomId = `${socket.id}#${opponent.id}`;
                socket.join(roomId);
                opponent.join(roomId);

                const problem = getSampleProblem();

                io.to(roomId).emit('codingMatchFound', {
                    roomId,
                    players: [socket.username, opponent.username],
                    problem,
                    startTime: Date.now(),
                });

                console.log(`⚔️ Coding match started between ${socket.username} and ${opponent.username}`);
            } else {
                waitingCoder = socket;
                socket.emit('waitingForCodingOpponent');
            }
        });

        // 📤 Handle code submission + execution
        socket.on('submitCode', async ({ roomId, submission }) => {
            console.log(`📤 ${socket.username} submitted code in room ${roomId}`);

            const problem = getSampleProblem(); // 🔁 Keep same problem context

            // ✅ Include input during evaluation
            const result = await executeCode({
                language: submission.language,
                source_code: submission.code,
                stdin: problem.input,
                expected_output: problem.expectedOutput,
            });

            const verdict = result.status?.description === 'Accepted'
                ? '✅ Correct'
                : result.status?.description || '❌ Error';

            const enhancedSubmission = {
                ...submission,
                output: result.output?.trim(),
                time: result.time,
                memory: result.memory,
                verdict,
            };

            // Send to both players
            socket.to(roomId).emit('opponentSubmitted', enhancedSubmission);
            socket.emit('yourSubmissionResult', enhancedSubmission);
        });


        // 🔴 Cleanup
        socket.on('disconnect', () => {
            if (waitingCoder === socket) waitingCoder = null;
            console.log('🔴 [Coding] Socket disconnected:', socket.id);
        });
    });
};

const problems = require('../data/codingProblems');
// 📚 Static problem (must match client-side)
function getSampleProblem() {
    const randomIndex = Math.floor(Math.random() * problems.length);
    return problems[randomIndex];
}
