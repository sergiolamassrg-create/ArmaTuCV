// Implementación transitoria de Fase 2/3. En Fase 4 se separa el acceso SQL.
const repositorio = {};
const sql = require("mssql");
const { obtenerConexionSQL } = require("../database/conexion");
const consultas = require("../database/consultas");

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

repositorio.listar = async (usuarioId) => {
  const conexion = await obtenerConexionSQL();
  const resultado = await conexion
    .request()
    .input("usuarioId", sql.Int, usuarioId)
    .query(consultas.listarFotos);
  return resultado.recordset.map(presentar);
};

repositorio.crear = async (nombre, contenido, usuarioId) => {
  const conexion = await obtenerConexionSQL();
  const resultado = await conexion
    .request()
    .input("usuarioId", sql.Int, usuarioId)
    .input("nombre", sql.NVarChar(100), nombre)
    .input("contenido", sql.VarBinary(sql.MAX), contenido)
    .query(consultas.crearFoto);
  return presentar(resultado.recordset[0]);
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

const servicio = {};

function errorDeFoto(mensaje, status = 400) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

servicio.listar = async (usuarioId) => await repositorio.listar(usuarioId);

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
    return await repositorio.crear(datos.nombre.trim(), contenido, usuarioId);
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

exports.listar = async (req, res, next) => {
  try {
    res
      .set("Cache-Control", "no-store")
      .json(await servicio.listar(res.locals.usuario.id));
  } catch (error) {
    next(error);
  }
};

exports.crear = async (req, res, next) => {
  try {
    const foto = await servicio.crear(req.body, res.locals.usuario.id);
    res.status(foto.reutilizada ? 200 : 201).json(foto);
  } catch (error) {
    next(error);
  }
};
