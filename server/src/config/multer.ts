import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();
// We're using memory storage instead of disk — the file lives in RAM
// temporarily while we parse it, then we store the parsed data in MongoDB.
// This avoids dealing with file cleanup and works great for files under 10MB.

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedExtensions = ['.csv', '.json'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and JSON files are allowed'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
});