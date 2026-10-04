export const config = {
  api: {
    bodyParser: false,
  },
};

/* =========================================================
   RATE LIMIT — 3x per hari per IP
   ========================================================= */
const submissions = new Map(); // Map<ip, { count, resetAt }>
const RATE_LIMIT = 3; // max 3x
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 jam

function checkRateLimit(ip) {
  const now = Date.now();
  const record = submissions.get(ip);

  // Belum ada record, atau window udah expired → reset
  if (!record || now > record.resetAt) {
    submissions.set(ip, {
      count: 1, resetAt: now + WINDOW_MS
    });
    return {
      ok: true,
      remaining: RATE_LIMIT - 1
    };
  }

  // Udah lewat limit
  if (record.count >= RATE_LIMIT) {
    const sisaMs = record.resetAt - now;
    const jam = Math.floor(sisaMs / 3600000);
    const menit = Math.ceil((sisaMs % 3600000) / 60000);
    return {
      ok: false,
      sisaMs,
      pesan: jam > 0
      ? `${jam} jam ${menit} menit`: `${menit} menit`
    };
  }

  // Masih ada kuota
  record.count++;
  submissions.set(ip, record);
  return {
    ok: true,
    remaining: RATE_LIMIT - record.count
  };
}

/* =========================================================
   PARSE MULTIPART/FORM-DATA
   ========================================================= */
async function parseFormData(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
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

    const [rawHeaders,
      ...rest] = part.split('\r\n\r\n');
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
        contentType: typeMatch ? typeMatch[1]: 'application/octet-stream',
        data: Buffer.from(body, 'binary'),
      };
    } else {
      fields[fieldName] = body;
    }
  }

  return {
    fields,
    file
  };
}

/* =========================================================
   HELPER — Ambil IP user
   ========================================================= */
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

/* =========================================================
   HANDLER
   ========================================================= */
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({
        error: 'Bot token / chat ID belum disetel'
      });
    }

    const ip = getClientIP(req);

    // ============ RATE LIMIT CHECK ============
    const rl = checkRateLimit(ip);
    if (!rl.ok) {
      return res.status(429).json({
        error: `⏳ Kamu sudah mencapai batas 3x pendaftaran per hari. Coba lagi dalam ${rl.pesan}.`,
        sisaMs: rl.sisaMs
      });
    }

    // ============ PARSE FORM ============
    const {
      fields,
      file
    } = await parseFormData(req);

    // ============ ANTI-SPAM ============
    // 1. Honeypot (bot auto-isi field ini)
    if (fields.website && fields.website.trim() !== '') {
      return res.status(200).json({
        ok: true
      }); // pretend success
    }

    // 2. Time-based (min 3 detik isi form)
    const loadTime = parseInt(fields.loadTime || '0');
    if (loadTime && Date.now() - loadTime < 3000) {
      return res.status(200).json({
        ok: true
      }); // pretend success
    }

    // 3. Validasi wajib — nama
    const nama = (fields.nama || '').trim();
    if (nama.length < 2 || nama.length > 50) {
      return res.status(400).json({
        error: 'Nama harus 2-50 karakter'
      });
    }

    // 4. Validasi WA
    const waClean = (fields.wa || '').replace(/[\s\-\(\)]/g, '');
    if (!/^(\+?62|0)8[1-9][0-9]{6,12}$/.test(waClean)) {
      return res.status(400).json({
        error: 'Format Nomor WA tidak valid. Contoh: 08123456789'
      });
    }

    // 5. Validasi URL (kalau diisi)
    const urlFields = ['saluran',
      'tiktok',
      'ig',
      'youtube',
      'discord',
      'linkedin',
      'telegram',
      'github'];
    for (const u of urlFields) {
      const val = (fields[u] || '').trim();
      if (val !== '' && !/^https?:\/\/.+\..+/.test(val)) {
        return res.status(400).json({
          error: `Link ${u} harus pakai https://`
        });
      }
    }

    // 6. Limit panjang pesan
    if ((fields.pesan || '').length > 500) {
      return res.status(400).json({
        error: 'Pesan max 500 karakter'
      });
    }

    // ============ SUSUN CAPTION ============
    const esc = (s) => (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

    const lines = [
      '<b>🎮 PENDAFTARAN A.R.M.C BARU</b>',
      '━━━━━━━━━━━━━━━━━━━━',
      '',
      '<b>👤 Nama:</b> ' + esc(fields.nama),
      '<b>📱 WhatsApp:</b> ' + esc(fields.wa),
      '',
      '<b>🔗 Sosial Media & Channel:</b>',
      fields.saluran ? '• Saluran WA: ' + esc(fields.saluran): null,
      fields.tiktok ? '• TikTok: ' + esc(fields.tiktok): null,
      fields.ig ? '• Instagram: ' + esc(fields.ig): null,
      fields.youtube ? '• YouTube: ' + esc(fields.youtube): null,
      fields.discord ? '• Discord: ' + esc(fields.discord): null,
      fields.linkedin ? '• LinkedIn: ' + esc(fields.linkedin): null,
      fields.telegram ? '• Telegram: ' + esc(fields.telegram): null,
      fields.github ? '• GitHub: ' + esc(fields.github): null,
      fields.pesan ? '\n<b>💬 Pesan:</b>\n' + esc(fields.pesan): null,
      '',
      '━━━━━━━━━━━━━━━━━━━━',
      `<i>IP: ${ip}</i>`,
      `<i>Kuota hari ini: ${rl.remaining}/3 tersisa</i>`,
      '<i>Dikirim via web pendaftaran A.R.M.C</i>',
    ].filter(Boolean);

    let caption = lines.join('\n');
    let extraText = null;

    // Kalau caption > 1024 char (limit Telegram untuk photo)
    if (caption.length > 1024) {
      extraText = caption;
      caption = caption.slice(0, 1000) + '\n<i>... (dilanjut di pesan berikutnya)</i>';
    }

    // ============ KIRIM KE TELEGRAM ============
    if (file && file.data && file.data.length > 0) {
      // Ada foto → sendPhoto
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
      const blob = new Blob([file.data], {
        type: file.contentType
      });
      formData.append('photo', blob, file.filename || 'foto.jpg');

      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData,
      });
      const tgData = await tgRes.json();
      if (!tgData.ok) throw new Error(tgData.description || 'Gagal kirim foto');
    } else {
      // Gak ada foto → sendMessage
      const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: caption,
          parse_mode: 'HTML',
        }),
      });
      const tgData = await tgRes.json();
      if (!tgData.ok) throw new Error(tgData.description || 'Gagal kirim pesan');
    }

    // Kalau caption kepanjangan, kirim susulan
    if (extraText) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: extraText,
          parse_mode: 'HTML',
        }),
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Pendaftaran terkirim',
      remaining: rl.remaining
    });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({
      error: err.message || 'Server error'
    });
  }
}