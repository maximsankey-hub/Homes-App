import multer from 'multer';

// Files are held in memory only, then streamed straight to Supabase Storage —
// there's no writable persistent disk in a serverless deployment.
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
