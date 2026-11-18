const repositorio = {};
const sql = require('mssql');
const { obtenerConexionSQL } = require('../database/conexion');
const consultas = require('../database/consultas');

repositorio.listar = async (usuarioId) => {
  const conexion = await obtenerConexionSQL();
  return (
    await conexion
      .request()
      .input('usuarioId', sql.Int, usuarioId)
      .query(consultas.listarCurriculums)
  ).recordset;
};

repositorio.obtener = async (id, usuarioId, esAdministrador = false) => {
  const conexion = await obtenerConexionSQL();
  const resultado = await conexion
    .request()
    .input('id', sql.Int, id)
    .input('usuarioId', sql.Int, usuarioId)
    .input('esAdministrador', sql.Bit, esAdministrador)
    .query(consultas.obtenerCurriculum);
  const curriculum = resultado.recordsets[0][0];
  if (!curriculum) return undefined;
  curriculum.experiencias = resultado.recordsets[1];
  curriculum.educaciones = resultado.recordsets[2];
  curriculum.habilidades = resultado.recordsets[3];
  curriculum.idiomas = resultado.recordsets[4];
  curriculum.complementos = resultado.recordsets[5];
  return curriculum;
};

async function guardarSecciones(transaccion, curriculumId, curriculum) {
  for (const experiencia of curriculum.experiencias) {
    await new sql.Request(transaccion)
      .input('curriculumId', sql.Int, curriculumId)
      .input('puesto', sql.NVarChar(150), experiencia.puesto)
      .input('empresa', sql.NVarChar(150), experiencia.empresa)
      .input('fechaInicio', sql.Date, experiencia.fechaInicio)
      .input('fechaFin', sql.Date, experiencia.fechaFin)
      .input('descripcion', sql.NVarChar(2000), experiencia.descripcion)
      .query(consultas.insertarExperiencia);
  }
  for (const educacion of curriculum.educaciones) {
    await new sql.Request(transaccion)
      .input('curriculumId', sql.Int, curriculumId)
      .input('titulo', sql.NVarChar(200), educacion.titulo)
      .input('institucion', sql.NVarChar(200), educacion.institucion)
      .input('anioInicio', sql.SmallInt, educacion.anioInicio)
      .input('anioFin', sql.SmallInt, educacion.anioFin)
      .input('estado', sql.NVarChar(40), educacion.estado)
      .query(consultas.insertarEducacion);
  }
  for (const habilidad of curriculum.habilidades) {
    await new sql.Request(transaccion)
      .input('curriculumId', sql.Int, curriculumId)
      .input('nombre', sql.NVarChar(120), habilidad.nombre)
      .input('tipo', sql.VarChar(10), habilidad.tipo)
      .query(consultas.insertarHabilidad);
  }
  for (const idioma of curriculum.idiomas) {
    await new sql.Request(transaccion)
      .input('curriculumId', sql.Int, curriculumId)
      .input('idioma', sql.NVarChar(80), idioma.idioma)
      .input('nivel', sql.NVarChar(60), idioma.nivel)
      .query(consultas.insertarIdioma);
  }
  for (const complemento of curriculum.complementos) {
    await new sql.Request(transaccion)
      .input('curriculumId', sql.Int, curriculumId)
      .input('tipo', sql.VarChar(15), complemento.tipo)
      .input('titulo', sql.NVarChar(200), complemento.titulo)
      .input('descripcion', sql.NVarChar(2000), complemento.descripcion)
      .input('anio', sql.SmallInt, complemento.anio)
      .query(consultas.insertarComplemento);
  }
}

async function guardarEnBase(curriculum, usuarioId, id) {
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
      .input('usuarioId', sql.Int, usuarioId)
      .input('titulo', sql.NVarChar(150), curriculum.titulo)
      .input('puesto', sql.NVarChar(180), curriculum.puesto)
      .input('resumen', sql.NVarChar(2000), curriculum.resumen)
      .input('tamanoLetra', sql.Decimal(3, 1), curriculum.tamanoLetra)
      .input('mostrarIconos', sql.Bit, curriculum.mostrarIconos)
      .query(id ? consultas.actualizarCurriculum : consultas.crearCurriculum);
    const guardado = resultado.recordset[0];
    if (!guardado) {
      await transaccion.rollback();
      return undefined;
    }
    await new sql.Request(transaccion)
      .input('id', sql.Int, guardado.id)
      .query(consultas.eliminarSecciones);
    await guardarSecciones(transaccion, guardado.id, curriculum);
    await transaccion.commit();
    return await repositorio.obtener(guardado.id, usuarioId, false);
  } catch (error) {
    if (!revertida) await transaccion.rollback();
    throw error;
  }
}

repositorio.crear = async (curriculum, usuarioId) => await guardarEnBase(curriculum, usuarioId);

repositorio.actualizar = async (id, curriculum, usuarioId) =>
  await guardarEnBase(curriculum, usuarioId, id);

repositorio.eliminar = async (id, usuarioId) => {
  const conexion = await obtenerConexionSQL();
  return (
    await conexion
      .request()
      .input('id', sql.Int, id)
      .input('usuarioId', sql.Int, usuarioId)
      .query(consultas.eliminarCurriculum)
  ).rowsAffected[0];
};

module.exports = repositorio;
