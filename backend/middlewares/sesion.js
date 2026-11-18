const session = require('express-session');
const usuarios = require('../services/usuario-servicio');

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('Configurá SESSION_SECRET con al menos 32 caracteres en .env.');
}

exports.configurar = session({
  name: 'armatucv.sesion',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 },
});

exports.obtenerUsuario = async (req) => {
  if (!req.session.usuarioId) return null;
  const usuario = await usuarios.consultarCuenta(req.session.usuarioId);
  if (!usuario || !usuario.activo) return null;
  return usuario;
};

exports.verificarSesion = async (req, res, next) => {
  try {
    const usuario = await exports.obtenerUsuario(req);
    if (!usuario) return res.status(401).json({ mensaje: 'Iniciá sesión para continuar.' });
    res.locals.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
};

exports.verificarAdministrador = (req, res, next) => {
  if (res.locals.usuario.rol !== 'administrador') {
    return res.status(403).json({ mensaje: 'Esta función requiere una cuenta administradora.' });
  }
  next();
};
