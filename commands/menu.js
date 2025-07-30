module.exports = {
    name: 'menu',
    run: async (sock, msg, args) => {
        const menu = `
🌟 *Dara Studio Bot Commands* 🌟

🗣️ .hello - Say hello
🕒 .time - Show current time
📋 .menu - Show this menu

More coming soon...
        `.trim();

        await sock.sendMessage(msg.key.remoteJid, { text: menu });
    }
};
