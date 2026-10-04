const fotoInput = document.getElementById('fotoInput');
const preview = document.getElementById('preview');
const form = document.getElementById('daftarForm');
const submitBtn = document.getElementById('submitBtn');
const result = document.getElementById('result');
const uploadLabel = document.querySelector('.photo-upload');

/* ========== TRACK WAKTU LOAD PAGE (anti-bot) ========== */
const pageLoadTime = Date.now();

/* ========== FOTO PREVIEW ========== */
fotoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showResult('error', '❌ Ukuran foto terlalu besar. Maksimal 5MB.');
    fotoInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (ev) => {
    preview.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

/* ========== DRAG & DROP ========== */
['dragenter', 'dragover'].forEach(evt => {
  uploadLabel.addEventListener(evt, (e) => {
    e.preventDefault();
    uploadLabel.classList.add('dragging');
  });
});
['dragleave', 'drop'].forEach(evt => {
  uploadLabel.addEventListener(evt, (e) => {
    e.preventDefault();
    uploadLabel.classList.remove('dragging');
  });
});
uploadLabel.addEventListener('drop', (e) => {
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const dt = new DataTransfer();
    dt.items.add(file);
    fotoInput.files = dt.files;
    fotoInput.dispatchEvent(new Event('change'));
  }
});

/* ========== SHOW RESULT ========== */
function showResult(type, msg, durasi = 8000) {
  result.className = 'result show ' + type;
  result.innerHTML = msg;
  if (type === 'error') {
    setTimeout(() => result.classList.remove('show'), durasi);
  }
}

/* ========== SUBMIT ========== */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // 1. Honeypot check
  if (form.website.value.trim() !== '') {
    showResult('error', '❌ Terdeteksi aktivitas mencurigakan.');
    return;
  }

  // 2. Time-based check (min 3 detik isi form)
  if (Date.now() - pageLoadTime < 3000) {
    showResult('error', '⚠️ Form terlalu cepat diisi. Coba lagi.');
    return;
  }

  // 3. Validasi wajib
  const nama = form.nama.value.trim();
  const wa = form.wa.value.trim();

  if (!nama || nama.length < 2) {
    showResult('error', '❌ Nama wajib diisi (min 2 karakter).');
    return;
  }
  if (!wa) {
    showResult('error', '❌ Nomor WA wajib diisi.');
    return;
  }

  // 4. Validasi WA format
  const waClean = wa.replace(/[\s\-\(\)]/g, '');
  if (!/^(\+?62|0)8[1-9][0-9]{6,12}$/.test(waClean)) {
    showResult('error', '❌ Format Nomor WA tidak valid. Contoh: 08123456789');
    return;
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
    const val = form[u].value.trim();
    if (val !== '' && !/^https?:\/\/.+\..+/.test(val)) {
      showResult('error', `❌ Link <strong>${u}</strong> harus pakai https://`);
      return;
    }
  }

  // Set loading
  submitBtn.disabled = true;
  const originalHTML = submitBtn.innerHTML;
  submitBtn.innerHTML = `<div class="btn-spinner"></div><span>Mengirim...</span>`;
  result.classList.remove('show');

  try {
    const formData = new FormData(form);
    formData.append('loadTime', pageLoadTime);

    const res = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });

    // Safe parse response
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Server error: ' + text.slice(0, 150));
    }

    // Handle rate limit (429)
    if (res.status === 429) {
      showResult('error',
        `⏳ <strong>Batas harian tercapai.</strong><br>` +
        (data.error || 'Kamu udah 3x daftar hari ini. Coba lagi besok ya!')
      );
      return;
    }

    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengirim data');
    }

    // Sukses
    showResult('success',
      '✅ <strong>Pendaftaran terkirim!</strong><br>' +
      'Data kamu sudah masuk ke admin A.R.M.C. ' +
      'Mohon tunggu konfirmasi via WhatsApp ya!'
    );

    // Reset form
    form.reset();
    preview.src = 'default.png';
    result.scrollIntoView({
      behavior: 'smooth', block: 'center'
    });

  } catch (err) {
    console.error(err);
    showResult('error',
      '❌ <strong>Gagal mengirim.</strong><br>' +
      (err.message || 'Coba lagi beberapa saat.')
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
  }
});