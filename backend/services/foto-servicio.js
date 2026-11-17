const repositorio = require("../repositories/foto-repositorio");

function presentar(foto) {
  return {
    id: foto.id,
    nombre: foto.nombre,
    creadoEn: foto.creadoEn,
    enUso: foto.enUso,
    bytes: foto.contenido.length,
    reutilizada: foto.reutilizada === true,
    foto: "data:image/jpeg;base64," + foto.contenido.toString("base64"),
  };
}

const servicio = {};

function errorDeFoto(mensaje, status = 400) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

servicio.listar = async (usuarioId) =>
  (await repositorio.listar(usuarioId)).map(presentar);

servicio.crear = async (datos, usuarioId) => {
  if (
    !datos ||
    typeof datos.nombre !== "string" ||
    !datos.nombre.trim() ||
    datos.nombre.length > 100
  ) {
    throw errorDeFoto("La foto necesita un nombre de hasta 100 caracteres.");
  }
  const foto = datos.foto;
  if (
    typeof foto !== "string" ||
    foto.length > 120023 ||
    !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(foto)
  ) {
    throw errorDeFoto(
      "La foto debe ser JPEG y ocupar hasta 90 KB después de reducirla.",
    );
  }
  const contenido = Buffer.from(foto.slice(23), "base64");
  if (
    contenido.length < 4 ||
    contenido.length > 90000 ||
    contenido.readUInt16BE(0) !== 0xffd8 ||
    contenido.readUInt16BE(contenido.length - 2) !== 0xffd9
  ) {
    throw errorDeFoto("El contenido de la foto no es válido.");
  }

  try {
    const fotoGuardada = await repositorio.crear(datos.nombre.trim(), contenido, usuarioId);
    return presentar(fotoGuardada);
  } catch (error) {
    if (error.number === 51001) {
      throw errorDeFoto(
        "Ya tenés 5 fotos. Eliminá una que no esté en uso para cargar otra.",
        409,
      );
    }
    throw error;
  }
};

servicio.eliminar = async (id, usuarioId) => {
  const identificador = Number(id);
  if (
    !Number.isInteger(identificador) ||
    identificador < 1 ||
    identificador > 2147483647
  )
    throw errorDeFoto("El identificador de la foto no es válido.");
  try {
    return await repositorio.eliminar(identificador, usuarioId);
  } catch (error) {
    if (error.number === 547)
      throw errorDeFoto(
        "La foto está vinculada a un CV. Cambiá su foto o elegí Sin foto y guardá el diseño antes de eliminarla.",
        409,
      );
    throw error;
  }
};


module.exports = servicio;
