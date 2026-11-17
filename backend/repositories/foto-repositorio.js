const repositorio = {};
const sql = require("mssql");
const { obtenerConexionSQL } = require("../database/conexion");
const consultas = require("../database/consultas");

repositorio.listar = async (usuarioId) => {
  const conexion = await obtenerConexionSQL();
  const resultado = await conexion
    .request()
    .input("usuarioId", sql.Int, usuarioId)
    .query(consultas.listarFotos);
  return resultado.recordset;
};

repositorio.crear = async (nombre, contenido, usuarioId) => {
  const conexion = await obtenerConexionSQL();
  const resultado = await conexion
    .request()
    .input("usuarioId", sql.Int, usuarioId)
    .input("nombre", sql.NVarChar(100), nombre)
    .input("contenido", sql.VarBinary(sql.MAX), contenido)
    .query(consultas.crearFoto);
  return resultado.recordset[0];
};

repositorio.eliminar = async (id, usuarioId) => {
  const conexion = await obtenerConexionSQL();
  const resultado = await conexion
    .request()
    .input("id", sql.Int, id)
    .input("usuarioId", sql.Int, usuarioId)
    .query(consultas.eliminarFoto);
  return resultado.rowsAffected[0];
};

module.exports = repositorio;
