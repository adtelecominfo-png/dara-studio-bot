const { Boom } = require('@hapi/boom');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

const { state, saveState } = useSingleFileAuthState('./sessions/cred.json');
const commandsDir = path.join(__dirname, 'commands');

// Load all command files
const commands = {};
fs.readdirSync(commandsDir).forEach(file => {
    if (file.endsWith('.js')) {
        const command = require(`./commands/${file}`);
        commands[command.name] = command;
    }
});

async function startBot() {
    const sock = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Dara Studio Bot Connected');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';

        const prefix = '.';
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = commands[commandName];
        if (command) {
            try {
                await command.run(sock, msg, args);
            } catch (err) {
                console.error(err);
                await sock.sendMessage(from, { text: '❌ Error running command!' });
            }
        }
    });
}

startBot();
