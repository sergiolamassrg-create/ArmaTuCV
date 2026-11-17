const servicio = require('../services/perfil-servicio');

exports.obtener = async (req, res, next) => {
  try {
    const perfil = await servicio.obtener(res.locals.usuario.id);
    if (!perfil)
      return res
        .status(404)
        .json({ mensaje: "No se encontraron tus datos personales." });
    res.json(perfil);
  } catch (error) {
    next(error);
  }
};

exports.actualizar = async (req, res, next) => {
  try {
    const perfil = await servicio.actualizar(req.body, res.locals.usuario.id);
    if (!perfil) return res.status(404).json({ mensaje: 'No se encontraron tus datos personales.' });
    res.json(perfil);
  } catch (error) { next(error); }
};
