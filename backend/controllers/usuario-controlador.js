const servicio = require('../services/usuario-servicio');

exports.listar = async (req, res, next) => {
    try {
        res.json(await servicio.listar());
    } catch (error) {
        next(error);
    }
};
exports.obtener = async (req, res, next) => {
    try {
        res.json(await servicio.obtener(req.params.id));
    } catch (error) {
        next(error);
    }
};
exports.crear = async (req, res, next) => {
    try {
        res.status(201).json(await servicio.crear(req.body));
    } catch (error) {
        next(error);
    }
};
exports.actualizar = async (req, res, next) => {
    try {
        res.json(await servicio.actualizar(req.params.id, req.body, res.locals.usuario.id));
    } catch (error) {
        next(error);
    }
};
exports.desactivar = async (req, res, next) => {
    try {
        await servicio.desactivar(req.params.id, res.locals.usuario.id);
        res.json({ mensaje: 'Cuenta desactivada. Sus currículums se conservaron.' });
    } catch (error) { next(error); }
};
exports.curriculums = async (req, res, next) => {
    try {
        res.json(await servicio.curriculums(req.params.id));
    } catch (error) {
        next(error);
    }
};

exports.operaciones = servicio;
exports.consultarCuenta = servicio.consultarCuenta;
