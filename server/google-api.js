/**
 * NASA KIWE - Backend Server (Modular Version)
 * Main Entry Point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import googleRoutes from './routes/googleRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de Seguridad Básico
app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://*.googleusercontent.com https://*.supabase.co https://*.supabase.in",
        "connect-src 'self' https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://apis.google.com https://accounts.google.com https://oauth2.googleapis.com",
        "frame-src https://accounts.google.com",
        "worker-src blob:"
    ].join('; '));

    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Servir frontend en producción
app.use(express.static(path.resolve(__dirname, '../dist')));

// Rutas de Salud
app.get('/status', (req, res) => {
    res.json({ status: 'NASA KIWE API is running (Modular)', version: '2.0.0' });
});

// API Routes protegidas
app.use('/api/google', authMiddleware, googleRoutes);

// SPA Fallback
app.use((req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'), (err) => {
        if (err) {
            res.status(200).send('NASA KIWE Backend Operational. Check frontend deployment.');
        }
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Servidor modular corriendo en puerto ${PORT}`);
});
