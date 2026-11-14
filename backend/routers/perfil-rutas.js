const express = require('express');
const controlador = require('../controllers/perfil-controlador');
const enrutador = express.Router();
enrutador.get('/', controlador.obtener);
enrutador.put('/', controlador.actualizar);
module.exports = enrutador;
