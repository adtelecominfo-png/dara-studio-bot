module.exports = {
    name: 'hello',
    run: async (sock, msg, args) => {
        await sock.sendMessage(msg.key.remoteJid, { text: '👋 Hello from Dara Studio Bot!' });
    }
};
