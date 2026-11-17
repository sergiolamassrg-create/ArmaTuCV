const repositorio = {};
const sql = require("mssql");
const { obtenerConexionSQL } = require("../database/conexion");
const consultas = require("../database/consultas");


const secciones = [
  {
    campo: "experiencias",
    consulta: consultas.insertarExperiencia,
    parametros: {
      puesto: sql.NVarChar(150),
      empresa: sql.NVarChar(150),
      fechaInicio: sql.Date,
      fechaFin: sql.Date,
      descripcion: sql.NVarChar(2000),
    },
  },
  {
    campo: "educaciones",
    consulta: consultas.insertarEducacion,
    parametros: {
      titulo: sql.NVarChar(200),
      institucion: sql.NVarChar(200),
      anioInicio: sql.SmallInt,
      anioFin: sql.SmallInt,
      estado: sql.NVarChar(40),
    },
  },
  {
    campo: "habilidades",
    consulta: consultas.insertarHabilidad,
    parametros: { nombre: sql.NVarChar(120), tipo: sql.VarChar(10) },
  },
  {
    campo: "idiomas",
    consulta: consultas.insertarIdioma,
    parametros: { idioma: sql.NVarChar(80), nivel: sql.NVarChar(60) },
  },
  {
    campo: "complementos",
    consulta: consultas.insertarComplemento,
    parametros: {
      tipo: sql.VarChar(15),
      titulo: sql.NVarChar(200),
      descripcion: sql.NVarChar(2000),
      anio: sql.SmallInt,
    },
  },
];

repositorio.listar = async (usuarioId) => {
  const conexion = await obtenerConexionSQL();
  return (
    await conexion
      .request()
      .input("usuarioId", sql.Int, usuarioId)
      .query(consultas.listarCurriculums)
  ).recordset;
};

repositorio.obtener = async (id, usuarioId) => {
  const conexion = await obtenerConexionSQL();
  const resultado = await conexion
    .request()
    .input("id", sql.Int, id)
    .input("usuarioId", sql.Int, usuarioId)
    .query(consultas.obtenerCurriculum);
  const curriculum = resultado.recordsets[0][0];
  if (!curriculum) return undefined;
  for (let indice = 0; indice < secciones.length; indice++) {
    curriculum[secciones[indice].campo] = resultado.recordsets[indice + 1];
  }
  return curriculum;
};

async function guardarEnBase(curriculum, usuarioId, id) {
  const conexion = await obtenerConexionSQL();
  const transaccion = new sql.Transaction(conexion);
  let revertida = false;
  transaccion.on("rollback", () => {
    revertida = true;
  });
  await transaccion.begin();
  try {
    const resultado = await new sql.Request(transaccion)
      .input("id", sql.Int, id ?? null)
      .input("usuarioId", sql.Int, usuarioId)
      .input("titulo", sql.NVarChar(150), curriculum.titulo)
      .input("puesto", sql.NVarChar(180), curriculum.puesto)
      .input("resumen", sql.NVarChar(2000), curriculum.resumen)
      .input("fotoId", sql.Int, curriculum.fotoId)
      .input("plantilla", sql.NVarChar(8), curriculum.plantilla)
      .input("tamanoLetra", sql.Decimal(3, 1), curriculum.tamanoLetra)
      .input("mostrarIconos", sql.Bit, curriculum.mostrarIconos)
      .query(id ? consultas.actualizarCurriculum : consultas.crearCurriculum);
    const guardado = resultado.recordset[0];
    if (!guardado) {
      await transaccion.rollback();
      return undefined;
    }
    await new sql.Request(transaccion)
      .input("id", sql.Int, guardado.id)
      .query(consultas.eliminarSecciones);
    for (const seccion of secciones) {
      for (const registro of curriculum[seccion.campo]) {
        const peticion = new sql.Request(transaccion).input(
          "curriculumId",
          sql.Int,
          guardado.id,
        );
        for (const campo of Object.keys(seccion.parametros)) {
          peticion.input(campo, seccion.parametros[campo], registro[campo]);
        }
        await peticion.query(seccion.consulta);
      }
    }
    await transaccion.commit();
    return await repositorio.obtener(guardado.id, usuarioId);
  } catch (error) {
    if (!revertida) await transaccion.rollback();
    throw error;
  }
}

repositorio.crear = async (curriculum, usuarioId) =>
  await guardarEnBase(curriculum, usuarioId);

repositorio.actualizar = async (id, curriculum, usuarioId) =>
  await guardarEnBase(curriculum, usuarioId, id);

repositorio.eliminar = async (id, usuarioId) => {
  const conexion = await obtenerConexionSQL();
  return (
    await conexion
      .request()
      .input("id", sql.Int, id)
      .input("usuarioId", sql.Int, usuarioId)
      .query(consultas.eliminarCurriculum)
  ).rowsAffected[0];
};

module.exports = repositorio;
