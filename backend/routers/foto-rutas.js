const express = require("express");
const controlador = require("../controllers/foto-controlador");
const enrutador = express.Router();

enrutador.get("/", controlador.listar);
enrutador.post("/", controlador.crear);
enrutador.delete("/:id", controlador.eliminar);

module.exports = enrutador;
