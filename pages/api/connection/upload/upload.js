// pages/api/upload.js
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const form = formidable();

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Error parsing file:', err);
        return res.status(500).json({ error: 'Error parsing file' });
      }

      console.log('Parsed files:', files);

      // Access the file object correctly (first element in the array)
      const file = Array.isArray(files.file) ? files.file[0] : files.file;

      if (!file || !file.filepath) {
        return res.status(400).json({ error: 'Invalid file upload' });
      }

      // Read the file from disk
      const fileStream = fs.createReadStream(file.filepath);

      // Upload the file to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ error: 'Upload failed', details: error.message });
          }

          console.log('Cloudinary result:', result);
          res.status(200).json({ url: result.secure_url });
        }
      );

      // Pipe the file stream to Cloudinary
      fileStream.pipe(uploadStream);
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
