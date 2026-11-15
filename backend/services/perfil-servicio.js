const baseDatos = {};
const sql = require("mssql");
const { obtenerConexionSQL } = require("../database/conexion");
const consultas = require("../database/consultas");

baseDatos.obtener = async (usuarioId) => {
  const conexion = await obtenerConexionSQL();
  const perfil = (
    await conexion
      .request()
      .input("usuarioId", sql.Int, usuarioId)
      .query(consultas.obtenerPerfil)
  ).recordset[0];
  if (perfil) {
    // La base de demostración tiene enlaces antiguos sin protocolo.
    for (const campo of ["linkedin", "github", "portfolio"]) {
      if (
        perfil[campo] &&
        !perfil[campo].startsWith("https://") &&
        !perfil[campo].startsWith("http://")
      )
        perfil[campo] = "https://" + perfil[campo];
    }
  }
  return perfil;
};

baseDatos.actualizar = async (datos, usuarioId) => {
  const conexion = await obtenerConexionSQL();
  await conexion
    .request()
    .input("usuarioId", sql.Int, usuarioId)
    .input("nombre", sql.NVarChar(100), datos.nombre)
    .input("apellido", sql.NVarChar(100), datos.apellido)
    .input("telefono", sql.NVarChar(40), datos.telefono)
    .input("ubicacion", sql.NVarChar(200), datos.ubicacion)
    .input("linkedin", sql.NVarChar(250), datos.linkedin)
    .input("github", sql.NVarChar(250), datos.github)
    .input("portfolio", sql.NVarChar(250), datos.portfolio)
    .query(consultas.actualizarPerfil);
  return await baseDatos.obtener(usuarioId);
};

const servicio = {};
servicio.obtener = async (usuarioId) => await baseDatos.obtener(usuarioId);
servicio.actualizar = async (datos, usuarioId) => {
  const limites = {
    nombre: 100,
    apellido: 100,
    telefono: 40,
    ubicacion: 200,
    linkedin: 250,
    github: 250,
    portfolio: 250,
  };
  const perfil = {};
  const error = new Error("Revisá los datos personales y sus límites.");
  error.status = 400;
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) throw error;
  for (const campo of Object.keys(datos)) {
    if (!(campo in limites)) throw error;
  }
  for (const campo of Object.keys(limites)) {
    const valor = datos[campo] ?? "";
    if (typeof valor !== "string" || valor.length > limites[campo]) throw error;
    perfil[campo] = valor.trim();
  }
  if (!perfil.nombre || !perfil.apellido) throw error;
  for (const campo of ["linkedin", "github", "portfolio"]) {
    if (
      perfil[campo] &&
      !perfil[campo].startsWith("https://") &&
      !perfil[campo].startsWith("http://")
    ) {
      error.message = "Los enlaces deben comenzar con https:// o http://.";
      throw error;
    }
  }
  return await baseDatos.actualizar(perfil, usuarioId);
};


module.exports = servicio;
