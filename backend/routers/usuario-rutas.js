const express = require('express');
const controlador = require('../controllers/usuario-controlador');
const enrutador = express.Router();
enrutador.get('/', controlador.listar);
enrutador.get('/:id', controlador.obtener);
enrutador.post('/', controlador.crear);
module.exports = enrutador;
