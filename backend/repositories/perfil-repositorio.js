const repositorio = {};
const sql = require('mssql');
const { obtenerConexionSQL } = require('../database/conexion');
const consultas = require('../database/consultas');

repositorio.obtener = async (usuarioId) => {
  const conexion = await obtenerConexionSQL();
  const perfil = (
    await conexion.request().input('usuarioId', sql.Int, usuarioId).query(consultas.obtenerPerfil)
  ).recordset[0];
  return perfil;
};

repositorio.actualizar = async (datos, usuarioId) => {
  const conexion = await obtenerConexionSQL();
  await conexion
    .request()
    .input('usuarioId', sql.Int, usuarioId)
    .input('nombre', sql.NVarChar(100), datos.nombre)
    .input('apellido', sql.NVarChar(100), datos.apellido)
    .input('telefono', sql.NVarChar(40), datos.telefono)
    .input('ubicacion', sql.NVarChar(200), datos.ubicacion)
    .input('linkedin', sql.NVarChar(250), datos.linkedin)
    .input('github', sql.NVarChar(250), datos.github)
    .input('portfolio', sql.NVarChar(250), datos.portfolio)
    .query(consultas.actualizarPerfil);
  return await repositorio.obtener(usuarioId);
};

module.exports = repositorio;