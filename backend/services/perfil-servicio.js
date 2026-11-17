const repositorio = require("../repositories/perfil-repositorio");

function presentar(perfil) {
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
}

const servicio = {};

servicio.obtener = async (usuarioId) => presentar(await repositorio.obtener(usuarioId));

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
  return presentar(await repositorio.actualizar(perfil, usuarioId));
};


module.exports = servicio;