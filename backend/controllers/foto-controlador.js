const servicio = require('../services/foto-servicio');

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

exports.eliminar = async (req, res, next) => {
  try {
    const eliminado = await servicio.eliminar(req.params.id, res.locals.usuario.id);
    if (!eliminado) return res.status(404).json({ mensaje: 'La foto no existe.' });
    res.json({ mensaje: 'Foto eliminada de tu biblioteca.' });
  } catch (error) { next(error); }
};
