// api/upload/route.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed'
    });
  }

  try {
    // Ambil file dari request
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return res.status(400).json({
        error: 'File tidak ditemukan'
      });
    }

    // Forward ke API upload dengan key dari environment
    const forwardFormData = new FormData();
    forwardFormData.append('file', file);
    forwardFormData.append('r18', '0');
    forwardFormData.append('token', process.env.IMAGE_API_KEY);
    forwardFormData.append('sha256', '');

    const response = await fetch(process.env.IMAGE_API_URL, {
      method: 'POST',
      body: forwardFormData
    });

    const data = await response.json();

    if (data.status === 'success' && data.data?.url_direct) {
      res.status(200).json({
        success: true,
        url: data.data.url_direct
      });
    } else {
      throw new Error('Upload gagal');
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Gagal upload gambar'
    });
  }
}