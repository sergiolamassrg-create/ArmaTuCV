const express = require('express');
const { rateLimit } = require('express-rate-limit');
const controlador = require('../controllers/acceso-controlador');
const enrutador = express.Router();
const limitarIntentos = rateLimit({
    windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { mensaje: 'Demasiados intentos. Esperá 15 minutos antes de volver a intentar.' }
});
enrutador.use((req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
enrutador.get('/sesion', controlador.sesion);
enrutador.post('/ingreso', limitarIntentos, controlador.ingreso);
module.exports = enrutador;
