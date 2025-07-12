let waitingPlayer = null;

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('🟢 Socket connected:', socket.id);

        socket.on('joinArena', (username) => {
            socket.username = username;

            if (waitingPlayer) {
                const opponent = waitingPlayer;
                waitingPlayer = null;

                const roomId = `${socket.id}#${opponent.id}`;
                socket.join(roomId);
                opponent.join(roomId);

                const paragraph = generateParagraph();

                io.to(roomId).emit('matchFound', {
                    roomId,
                    players: [socket.username, opponent.username],
                    paragraph,
                });
            } else {
                waitingPlayer = socket;
                socket.emit('waitingForOpponent');
            }
        });

        socket.on('submitResult', ({ roomId, result }) => {
            socket.to(roomId).emit('opponentResult', result);
        });

        socket.on('disconnect', () => {
            if (waitingPlayer === socket) {
                waitingPlayer = null;
            }
            console.log('🔴 Socket disconnected:', socket.id);
        });
    });
};

function generateParagraph() {
    const paragraphs = require('../data/paragraphs');
    return paragraphs[Math.floor(Math.random() * paragraphs.length)];
}
