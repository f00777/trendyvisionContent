// server.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { checkAuth } from './middlewares/auth.js';

// Si quieres usar ES Modules en Node
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.FRONT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers permitidos
    credentials: true // Si necesitas enviar cookies o cabeceras con credenciales
}));
app.use(cookieParser());


const PORT = process.env.PORT || 3003;

// Middleware para subir archivos a memoria primero
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Carpeta base de uploads
const BASE_UPLOAD_DIR = path.join(__dirname, 'public', 'uploads');

// Crear carpeta base si no existe
if (!fs.existsSync(BASE_UPLOAD_DIR)) {
  fs.mkdirSync(BASE_UPLOAD_DIR, { recursive: true });
}

// Simulando el PUT del ejemplo, incluso actualizando "base de datos"
app.put('/api/upload', upload.array('images'), async (req, res) => {
  console.log("se logro entrar en esta wea")
  try {
    const { id } = req.body;
    const files = req.files;

    if (!id || !files || files.length === 0) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    const uploadDir = path.join(BASE_UPLOAD_DIR, id);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const urls= [];

    for (let i = 0; i < files.length; i++) {
      const buffer = files[i].buffer;
      const outputPath = path.join(uploadDir, `${i + 1}.webp`);

      await sharp(buffer)
        .resize(1000, 1000, { fit: 'cover' })
        .webp({ quality: 90 })
        .toFile(outputPath);

      urls.push(`/uploads/${id}/${i + 1}.webp`);

      // Aquí podrías actualizar tu base de datos si quieres
      // await db`UPDATE productos SET imagenes = ${urls} WHERE id = ${id}`
    }

    return res.json({ images: urls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al procesar imágenes' });
  }
});

// ------------------- Servir carpeta uploads -------------------
app.use('/uploads', express.static(BASE_UPLOAD_DIR));

// ------------------- Arrancar servidor -------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
