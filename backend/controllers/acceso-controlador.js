const usuarios = require('./usuario-controlador').operaciones;
const sesion = require('../middlewares/sesion');

exports.ingreso = async (req, res, next) => {
    try {
        const usuario = await usuarios.ingresar(req.body);
        // Cambiar el identificador evita reutilizar una sesión anterior al ingreso.
        req.session.regenerate(error => {
            if (error) return next(error);
            req.session.usuarioId = usuario.id;
            req.session.versionSesion = usuario.versionSesion;
            req.session.save(error => {
                if (error) return next(error);
                res.json(usuarios.datosPublicos(usuario));
            });
        });
    } catch (error) { next(error); }
};
exports.sesion = async (req, res, next) => {
    try {
        const usuario = await sesion.leer(req);
        res.json(usuario ? usuarios.datosPublicos(usuario) : null);
    } catch (error) { next(error); }
};
exports.registro = async (req, res, next) => {
    try {
        await usuarios.registrar(req.body);
        res.status(201).json({ mensaje: 'Cuenta creada. Ya podés ingresar.' });
    } catch (error) { next(error); }
};
exports.salida = (req, res, next) => {
    try {
        req.session.destroy(error => {
            if (error) return next(error);
            res.json({ mensaje: 'Sesión cerrada.' });
        });
    } catch (error) {
        next(error);
    } finally {
        sesion.limpiarCookie(res);
    }
};
