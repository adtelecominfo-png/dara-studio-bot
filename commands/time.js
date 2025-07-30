module.exports = {
    name: 'time',
    run: async (sock, msg, args) => {
        const now = new Date();
        await sock.sendMessage(msg.key.remoteJid, { text: `🕒 Current time: ${now.toLocaleTimeString()}` });
    }
};
