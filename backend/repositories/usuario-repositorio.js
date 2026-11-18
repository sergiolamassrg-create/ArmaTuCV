const repositorio = {};
const sql = require('mssql');
const { obtenerConexionSQL } = require('../database/conexion');
const consultas = require('../database/consultas');

repositorio.listar = async () => {
  const conexion = await obtenerConexionSQL();
  return (await conexion.request().query(consultas.listarUsuarios)).recordset;
};

repositorio.obtener = async (id) => {
  const conexion = await obtenerConexionSQL();
  return (await conexion.request().input('id', sql.Int, id).query(consultas.obtenerUsuario))
    .recordset[0];
};

repositorio.obtenerPorCorreo = async (correo) => {
  const conexion = await obtenerConexionSQL();
  return (
    await conexion
      .request()
      .input('email', sql.NVarChar(150), correo)
      .query(consultas.usuarioPorCorreo)
  ).recordset[0];
};

async function guardar(usuario, id) {
  const conexion = await obtenerConexionSQL();
  const transaccion = new sql.Transaction(conexion);
  let revertida = false;
  transaccion.on('rollback', () => {
    revertida = true;
  });
  await transaccion.begin();
  try {
    const resultado = await new sql.Request(transaccion)
      .input('id', sql.Int, id ?? null)
      .input('email', sql.NVarChar(150), usuario.email)
      .input('claveHash', sql.NVarChar(255), usuario.claveHash)
      .input('rol', sql.VarChar(15), usuario.rol === 'administrador' ? 'ADMIN' : 'USUARIO')
      .input('activo', sql.Bit, usuario.activo)
      .query(id ? consultas.actualizarUsuario : consultas.crearUsuario);
    const guardado = resultado.recordset[0];
    if (!guardado) {
      await transaccion.rollback();
      return undefined;
    }
    await new sql.Request(transaccion)
      .input('id', sql.Int, guardado.id)
      .input('nombre', sql.NVarChar(100), usuario.nombre)
      .input('apellido', sql.NVarChar(100), usuario.apellido)
      .query(id ? consultas.actualizarNombre : consultas.crearPerfil);
    await transaccion.commit();
    return await repositorio.obtener(guardado.id);
  } catch (error) {
    if (!revertida) await transaccion.rollback();
    throw error;
  }
}

repositorio.crear = async (usuario) => await guardar(usuario);

repositorio.actualizar = async (id, usuario) => await guardar(usuario, id);

repositorio.desactivar = async (id) => {
  const conexion = await obtenerConexionSQL();
  return (await conexion.request().input('id', sql.Int, id).query(consultas.desactivarUsuario))
    .rowsAffected[0];
};

repositorio.curriculums = async (id) => {
  const conexion = await obtenerConexionSQL();
  return (await conexion.request().input('id', sql.Int, id).query(consultas.curriculumsDeUsuario))
    .recordset;
};

module.exports = repositorio;