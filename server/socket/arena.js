let waitingPlayer = null;

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🟢 New socket connected:', socket.id);

        socket.on('joinArena', (userData) => {
            socket.userData = userData; // Save full user info

            if (waitingPlayer) {
                const opponentSocket = waitingPlayer;
                waitingPlayer = null;

                const roomId = `room-${socket.id}-${opponentSocket.id}`;
                socket.join(roomId);
                opponentSocket.join(roomId);

                const paragraph = generateParagraph();

                const matchInfo = {
                    roomId,
                    paragraph,
                    players: [
                        {
                            socketId: socket.id,
                            username: socket.userData.username,
                            userId: socket.userData.userId,
                        },
                        {
                            socketId: opponentSocket.id,
                            username: opponentSocket.userData.username,
                            userId: opponentSocket.userData.userId,
                        },
                    ],
                };

                io.to(roomId).emit('matchFound', matchInfo);
            } else {
                waitingPlayer = socket;
                socket.emit('waitingForOpponent');
            }
        });

        socket.on('submitResult', ({ roomId, username, accuracy, wpm }) => {
            socket.to(roomId).emit('opponentResult', { username, accuracy, wpm });
        });

        socket.on('disconnect', () => {
            console.log('🔴 Socket disconnected:', socket.id);
            if (waitingPlayer === socket) {
                waitingPlayer = null;
            }
        });
    });
};

function generateParagraph() {
    return `At the age of 35, David felt unfulfilled in his corporate job. He had spent the last 10 years climbing the ladder in finance, but his heart wasn't in it. He decided to take a leap of faith and pursue his passion for cooking. He enrolled in culinary school, worked as a line cook at a local restaurant, and eventually opened his own food truck. The first year was challenging, with long hours and razor-thin profit margins. But David's dedication and culinary skills paid off. Within 5 years, he had expanded to two brick-and-mortar restaurants and was featured in several food magazines. His career pivot was a testament to the power of following your passion and taking calculated risks.`;
}
