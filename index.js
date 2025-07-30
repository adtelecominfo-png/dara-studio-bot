const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Auth file storage
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Web server for QR code display
const app = express();
const port = process.env.PORT || 3000;

// Start Express server for Railway QR hosting
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.html'));
});

app.listen(port, () => {
  console.log(QR code hosted at http://localhost:${port});
});

async function startBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Save QR to html file
      fs.writeFileSync('./qr.html', <h2>Scan This QR Code in WhatsApp</h2><img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qr)}" />);
      console.log('QR code updated');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) startBot();
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp connected');
    }
  });

  sock.ev.on('creds.update', saveState);

  // Simple response command
  sock.ev.on('messages.upsert', async (msg) => {
    const m = msg.messages[0];
    if (!m.message || m.key.fromMe) return;

    const sender = m.key.remoteJid;
    const text = m.message.conversation || m.message.extendedTextMessage?.text || '';

    if (text.toLowerCase() === 'ping') {
      await sock.sendMessage(sender, { text: 'Pong! Dara Studio Bot is alive 🚀' });
    }

    if (text.toLowerCase() === 'menu') {
      await sock.sendMessage(sender, { text: '📜 Dara Studio Menu\n\nType any command:\n• ping\n• about\n• help\n• ai\n\n... More coming soon!' });
    }

    // Add more 2000+ command routes later
  });
}

startBot();
