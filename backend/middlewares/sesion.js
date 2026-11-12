const session = require('express-session');

exports.origenConfiable = (req, res, next) => {
    const metodos = ['POST', 'PUT', 'PATCH', 'DELETE'];
    const origen = process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:4200';
    if (metodos.includes(req.method) && req.get('origin') !== origen) {
        return res.status(403).json({ mensaje: 'La solicitud no proviene de la aplicación autorizada.' });
    }
    next();
};