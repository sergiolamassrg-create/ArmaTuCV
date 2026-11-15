const servicio = require('../services/curriculum-servicio');

exports.listar = async (req, res) => {
  try {
    const curriculums = await servicio.listar(res.locals.usuario.id);
    res.status(200).json(curriculums);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "No se pudieron consultar los currículums." });
  }
};

exports.obtener = async (req, res) => {
  try {
    const curriculum = await servicio.obtener(
      req.params.id,
      res.locals.usuario.id,
    );
    if (!curriculum) {
      return res.status(404).json({ mensaje: "El currículum no existe." });
    }
    res.status(200).json(curriculum);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje: "No se pudo consultar el currículum." });
  }
};

exports.crear = async (req, res) => {
  try {
    const curriculum = await servicio.crear(req.body, res.locals.usuario.id);
    res.status(201).json(curriculum);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje: "No se pudo guardar el currículum." });
  }
};

exports.actualizar = async (req, res) => {
  try {
    const curriculum = await servicio.actualizar(
      req.params.id,
      req.body,
      res.locals.usuario.id,
    );
    if (!curriculum) {
      return res.status(404).json({ mensaje: "El currículum no existe." });
    }
    res.status(200).json(curriculum);
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje: "No se pudo actualizar el currículum." });
  }
};

exports.eliminar = async (req, res) => {
  try {
    const filasEliminadas = await servicio.eliminar(
      req.params.id,
      res.locals.usuario.id,
    );
    if (filasEliminadas === 0) {
      return res.status(404).json({ mensaje: "El currículum no existe." });
    }
    res
      .status(200)
      .json({ mensaje: "El currículum se eliminó correctamente." });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje: "No se pudo eliminar el currículum." });
  }
};
