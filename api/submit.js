// api/submit.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper buat parse multipart/form-data tanpa library
async function parseFormData(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) throw new Error('No boundary found');

  const boundary = '--' + boundaryMatch[1];
  const parts = buffer.toString('binary').split(boundary);
  const fields = {};
  let file = null;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === '--\r\n' || part === '--' || part.trim() === '') continue;

    const [rawHeaders, ...rest] = part.split('\r\n\r\n');
    if (!rawHeaders) continue;
    const body = rest.join('\r\n\r\n').replace(/\r\n$/, '');

    const nameMatch = rawHeaders.match(/name="([^"]+)"/);
    const filenameMatch = rawHeaders.match(/filename="([^"]+)"/);
    const typeMatch = rawHeaders.match(/Content-Type:\s*([^\r\n]+)/i);

    if (!nameMatch) continue;
    const fieldName = nameMatch[1];

    if (filenameMatch) {
      file = {
        field: fieldName,
        filename: filenameMatch[1],
        contentType: typeMatch ? typeMatch[1] : 'application/octet-stream',
        data: Buffer.from(body, 'binary'),
      };
    } else {
      fields[fieldName] = body;
    }
  }

  return { fields, file };
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({ error: 'Bot token / chat ID belum disetel di Vercel' });
    }

    const { fields, file } = await parseFormData(req);

    // Susun caption (max 1024 char untuk sendPhoto)
    const esc = (s) => (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    const lines = [
      '<b>🎮 PENDAFTARAN A.R.M.C BARU</b>',
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      '<b>👤 Nama:</b> ' + esc(fields.nama),
      '<b>📱 WhatsApp:</b> ' + esc(fields.wa),
      '',
      '<b>🔗 Sosial Media & Channel:</b>',
      fields.saluran   ? '• Saluran WA: '  + esc(fields.saluran)   : null,
      fields.tiktok    ? '• TikTok: '      + esc(fields.tiktok)    : null,
      fields.ig        ? '• Instagram: '   + esc(fields.ig)        : null,
      fields.youtube   ? '• YouTube: '     + esc(fields.youtube)   : null,
      fields.discord   ? '• Discord: '     + esc(fields.discord)   : null,
      fields.linkedin  ? '• LinkedIn: '    + esc(fields.linkedin)  : null,
      fields.telegram  ? '• Telegram: '    + esc(fields.telegram)  : null,
      fields.github    ? '• GitHub: '      + esc(fields.github)    : null,
      fields.pesan     ? '\n<b>💬 Pesan:</b>\n' + esc(fields.pesan) : null,
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      '<i>Dikirim via web pendaftaran A.R.M.C</i>',
    ].filter(Boolean);

    let caption = lines.join('\n');

    // Kalau caption > 1024 char, potong & kirim sisanya sebagai text
    let extraText = null;
    if (caption.length > 1024) {
      extraText = caption;
      caption = caption.slice(0, 1000) + '\n<i>... (dilanjut di pesan berikutnya)</i>';
    }

    // Kalau ada foto → sendPhoto, kalau gak ada → sendMessage
    if (file && file.data && file.data.length > 0) {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
      const blob = new Blob([file.data], { type: file.contentType });
      formData.append('photo', blob, file.filename || 'foto.jpg');

      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });
      const tgData = await tgRes.json();
      if (!tgData.ok) throw new Error(tgData.description || 'Gagal kirim foto ke Telegram');
    } else {
      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: caption,
          parse_mode: 'HTML',
        }),
      });
      const tgData = await tgRes.json();
      if (!tgData.ok) throw new Error(tgData.description || 'Gagal kirim ke Telegram');
    }

    // Kalau caption kepanjangan, kirim pesan tambahan
    if (extraText) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: extraText,
          parse_mode: 'HTML',
        }),
      });
    }

    return res.status(200).json({ ok: true, message: 'Pendaftaran terkirim' });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}