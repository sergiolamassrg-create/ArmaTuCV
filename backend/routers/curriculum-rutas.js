const express = require('express');
const controlador = require('../controllers/curriculum-controlador');
const enrutador = express.Router();

enrutador.get('/', controlador.listar);
enrutador.get('/:id', controlador.obtener);
enrutador.post('/', controlador.crear);
enrutador.put('/:id', controlador.actualizar);
enrutador.delete('/:id', controlador.eliminar);

module.exports = enrutador;