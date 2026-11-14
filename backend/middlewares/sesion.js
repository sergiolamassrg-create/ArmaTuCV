const session = require("express-session");
const usuarios = require("../controllers/usuario-controlador");

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error(
    "Configurá SESSION_SECRET con al menos 32 caracteres en .env.",
  );
}
// MemoryStore es suficiente para la demostración local; no se permite usarlo en producción.
if (process.env.NODE_ENV === "production") {
  throw new Error(
    "Antes de publicar, configurar un almacén persistente de sesiones y HTTPS.",
  );
}
const opcionesCookie = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/api",
};

exports.configurar = session({
  name: "armatucv.sesion",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { ...opcionesCookie, maxAge: 2 * 60 * 60 * 1000 },
});

exports.limpiarCookie = (res) =>
  res.clearCookie("armatucv.sesion", opcionesCookie);

exports.leer = async (req) => {
  if (!req.session.usuarioId) return null;
  const usuario = await usuarios.consultarCuenta(req.session.usuarioId);
  if (
    !usuario ||
    !usuario.activo ||
    usuario.versionSesion !== req.session.versionSesion
  )
    return null;
  return usuario;
};

exports.requerir = async (req, res, next) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    const usuario = await exports.leer(req);
    if (!usuario)
      return res.status(401).json({ mensaje: "Iniciá sesión para continuar." });
    res.locals.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
};

exports.administrador = (req, res, next) => {
  if (res.locals.usuario.rol !== "administrador") {
    return res
      .status(403)
      .json({ mensaje: "Esta función requiere una cuenta administradora." });
  }
  next();
};

exports.origenConfiable = (req, res, next) => {
  const metodos = ["POST", "PUT", "PATCH", "DELETE"];
  const origen = process.env.FRONTEND_ORIGIN || "http://127.0.0.1:4200";
  if (metodos.includes(req.method) && req.get("origin") !== origen) {
    return res
      .status(403)
      .json({
        mensaje: "La solicitud no proviene de la aplicación autorizada.",
      });
  }
  next();
};
