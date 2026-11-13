const express = require('express');
const controlador = require('../controllers/perfil-controlador');
const enrutador = express.Router();
enrutador.get('/', controlador.obtener);
module.exports = enrutador;
