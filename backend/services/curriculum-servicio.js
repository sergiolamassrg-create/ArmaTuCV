const repositorio = require("../repositories/curriculum-repositorio");

const servicio = {};

function presentar(curriculum) {
  if (!curriculum) return curriculum;
  curriculum.foto = curriculum.foto
    ? "data:image/jpeg;base64," + curriculum.foto.toString("base64")
    : "";
  for (const campo of ["linkedin", "github", "portfolio"]) {
    if (
      curriculum[campo] &&
      !curriculum[campo].startsWith("https://") &&
      !curriculum[campo].startsWith("http://")
    )
      curriculum[campo] = "https://" + curriculum[campo];
  }
  return curriculum;
}

function errorDeDatos(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  return error;
}

function validarId(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero < 1 || numero > 2147483647)
    throw errorDeDatos("El identificador no es válido.");
  return numero;
}

function texto(valor, limite, nombre, obligatorio = false) {
  if (valor === undefined || valor === null) valor = "";
  if (
    typeof valor !== "string" ||
    valor.length > limite ||
    (obligatorio && !valor.trim())
  ) {
    throw errorDeDatos(
      "Revisá " + nombre + " (máximo " + limite + " caracteres).",
    );
  }
  return valor.trim();
}

function fecha(valor) {
  if (valor === "" || valor === null || valor === undefined) return null;
  if (typeof valor !== "string" || valor.length !== 10)
    throw errorDeDatos("Usá fechas válidas con formato año-mes-día.");
  const resultado = new Date(valor + "T00:00:00Z");
  if (
    Number.isNaN(resultado.getTime()) ||
    resultado.toISOString().slice(0, 10) !== valor ||
    valor < "0001-01-01"
  ) {
    throw errorDeDatos("La fecha no es válida.");
  }
  return valor;
}

function anio(valor) {
  if (valor === "" || valor === null || valor === undefined) return null;
  if (!Number.isInteger(valor) || valor < 1900 || valor > 2100)
    throw errorDeDatos("El año debe estar entre 1900 y 2100.");
  return valor;
}

function registros(datos, campo, preparar) {
  const lista = datos[campo] ?? [];
  if (!Array.isArray(lista) || lista.length > 20)
    throw errorDeDatos("Cada sección admite hasta 20 registros.");
  return lista.map((registro) => {
    if (!registro || typeof registro !== "object" || Array.isArray(registro))
      throw errorDeDatos("Revisá los registros de " + campo + ".");
    return preparar(registro);
  });
}

function prepararDatos(datos) {
  if (!datos || typeof datos !== "object" || Array.isArray(datos))
    throw errorDeDatos("Revisá el formulario.");
  const permitidos = [
    "titulo",
    "puesto",
    "resumen",
    "experiencias",
    "educaciones",
    "habilidades",
    "idiomas",
    "complementos",
    "fotoId",
    "plantilla",
    "tamanoLetra",
    "mostrarIconos",
  ];
  for (const campo of Object.keys(datos)) {
    if (!permitidos.includes(campo))
      throw errorDeDatos("El formulario contiene un campo no permitido.");
  }
  const cv = {
    titulo: texto(datos.titulo, 150, "el título", true),
    puesto: texto(datos.puesto, 180, "el puesto objetivo", true),
    resumen: texto(datos.resumen, 2000, "el resumen"),
    fotoId: datos.fotoId ?? null,
    plantilla: datos.plantilla ?? "sin-foto",
    tamanoLetra: datos.tamanoLetra ?? 11,
    mostrarIconos: datos.mostrarIconos ?? false,
  };
  if (
    !["sin-foto", "con-foto"].includes(cv.plantilla) ||
    ![10, 10.5, 11, 11.5, 12].includes(cv.tamanoLetra) ||
    typeof cv.mostrarIconos !== "boolean"
  )
    throw errorDeDatos("Revisá las opciones de diseño.");
  if (
    cv.fotoId !== null &&
    (typeof cv.fotoId !== "number" || validarId(cv.fotoId) !== cv.fotoId)
  )
    throw errorDeDatos("Elegí una foto válida.");
  if (cv.plantilla === "con-foto" && cv.fotoId === null)
    throw errorDeDatos("Elegí una foto o usá Sin foto.");
  if (cv.plantilla === "sin-foto") cv.fotoId = null;
  cv.experiencias = registros(datos, "experiencias", (r) => {
    const experiencia = {
      puesto: texto(r.puesto, 150, "el puesto", true),
      empresa: texto(r.empresa, 150, "la empresa", true),
      fechaInicio: fecha(r.fechaInicio),
      fechaFin: fecha(r.fechaFin),
      descripcion: texto(r.descripcion, 2000, "la descripción"),
    };
    if (
      experiencia.fechaInicio &&
      experiencia.fechaFin &&
      experiencia.fechaFin < experiencia.fechaInicio
    )
      throw errorDeDatos("La fecha de fin no puede ser anterior al inicio.");
    return experiencia;
  });
  cv.educaciones = registros(datos, "educaciones", (r) => {
    const educacion = {
      titulo: texto(r.titulo, 200, "el título de estudio", true),
      institucion: texto(r.institucion, 200, "la institución", true),
      anioInicio: anio(r.anioInicio),
      anioFin: anio(r.anioFin),
      estado: texto(r.estado, 40, "el estado"),
    };
    if (
      educacion.anioInicio &&
      educacion.anioFin &&
      educacion.anioFin < educacion.anioInicio
    )
      throw errorDeDatos("El año de fin no puede ser anterior al inicio.");
    return educacion;
  });
  cv.habilidades = registros(datos, "habilidades", (r) => {
    if (!["TECNICA", "BLANDA"].includes(r.tipo))
      throw errorDeDatos("Elegí el tipo de habilidad.");
    return { nombre: texto(r.nombre, 120, "la habilidad", true), tipo: r.tipo };
  });
  cv.idiomas = registros(datos, "idiomas", (r) => ({
    idioma: texto(r.idioma, 80, "el idioma", true),
    nivel: texto(r.nivel, 60, "el nivel", true),
  }));
  cv.complementos = registros(datos, "complementos", (r) => {
    if (!["CURSO", "CERTIFICACION", "PROYECTO"].includes(r.tipo))
      throw errorDeDatos("Elegí el tipo de complemento.");
    return {
      tipo: r.tipo,
      titulo: texto(r.titulo, 200, "el título del complemento", true),
      descripcion: texto(r.descripcion, 2000, "la descripción"),
      anio: anio(r.anio),
    };
  });
  return cv;
}

async function guardar(datos, usuarioId, id) {
  const cv = prepararDatos(datos);
  try {
    const guardado = id
      ? await repositorio.actualizar(id, cv, usuarioId)
      : await repositorio.crear(cv, usuarioId);
    return presentar(guardado);
  } catch (error) {
    if (error.number === 51002 || error.number === 547)
      throw errorDeDatos("La foto no está disponible en tu biblioteca.");
    if (error.number === 51003)
      throw errorDeDatos("Completá tus datos personales antes de crear un CV.");
    throw error;
  }
}

servicio.listar = async (usuarioId) => await repositorio.listar(usuarioId);

servicio.obtener = async (id, usuarioId) =>
  presentar(await repositorio.obtener(validarId(id), usuarioId));

servicio.crear = async (datos, usuarioId) => await guardar(datos, usuarioId);

servicio.actualizar = async (id, datos, usuarioId) =>
  await guardar(datos, usuarioId, validarId(id));

servicio.eliminar = async (id, usuarioId) =>
  await repositorio.eliminar(validarId(id), usuarioId);


module.exports = servicio;
