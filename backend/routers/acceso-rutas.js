const express = require('express');
const controlador = require('../controllers/acceso-controlador');
const enrutador = express.Router();

enrutador.get('/sesion', controlador.sesion);
enrutador.post('/ingreso', controlador.ingreso);
enrutador.post('/registro', controlador.registro);
enrutador.post('/salida', controlador.salida);

module.exports = enrutador;
