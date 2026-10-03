const fotoInput = document.getElementById('fotoInput');
const preview = document.getElementById('preview');
const form = document.getElementById('daftarForm');
const submitBtn = document.getElementById('submitBtn');
const result = document.getElementById('result');
const uploadLabel = document.querySelector('.photo-upload');

/* ========== FOTO PREVIEW ========== */
fotoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    showResult('error', 'Ukuran foto terlalu besar. Maksimal 5MB.');
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

/* ========== RESULT HELPER ========== */
function showResult(type, msg) {
  result.className = 'result show ' + type;
  result.innerHTML = msg;
  if (type === 'error') {
    setTimeout(() => result.classList.remove('show'), 8000);
  }
}

/* ========== SUBMIT ========== */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nama = form.nama.value.trim();
  const wa = form.wa.value.trim();

  if (!nama || !wa) {
    showResult('error', '❌ Nama dan Nomor WA wajib diisi.');
    return;
  }

  // Set loading state
  submitBtn.disabled = true;
  const originalHTML = submitBtn.innerHTML;
  submitBtn.innerHTML = `<div class="btn-spinner"></div><span>Mengirim...</span>`;
  result.classList.remove('show');

  try {
    const formData = new FormData(form);

    // Kirim ke serverless function
    const res = await fetch('/api/submit', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Gagal mengirim data');
    }

    showResult('success',
      '<strong>Pendaftaran terkirim!</strong><br>' +
      'Data kamu sudah masuk ke admin A.R.M.C. ' +
      'Mohon tunggu konfirmasi via WhatsApp ya!'
    );

    // Reset form
    form.reset();
    preview.src = 'default.png';

    // Scroll ke result
    result.scrollIntoView({
      behavior: 'smooth', block: 'center'
    });

  } catch (err) {
    console.error(err);
    showResult('error',
      '<strong>Gagal mengirim!</strong><br>' +
      (err.message || 'Coba lagi beberapa saat atau hubungi admin langsung.')
    );
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHTML;
  }
});