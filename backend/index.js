const express = require('express');
require('./database/config');
const rutasCurriculum = require('./routers/curriculum-rutas');
const rutasAcceso = require('./routers/acceso-rutas');
const rutasUsuarios = require('./routers/usuario-rutas');
const rutasFotos = require('./routers/foto-rutas');
const rutasPerfil = require('./routers/perfil-rutas');
const { configurar, requerir, administrador, origenConfiable } = require('./middlewares/sesion');

const aplicacion = express();
const direccion = process.env.HOST || '127.0.0.1';
const puerto = Number(process.env.PORT || 3000);

// Incluye la foto reducida del CV (hasta 90 KB) y sus textos.
aplicacion.use(express.json({ limit: '256kb' }));
aplicacion.use('/api', origenConfiable);
aplicacion.use('/api', configurar);
// El prefijo se suma a las rutas de cada router: /api/auth + /sesion.
// Estas rutas devuelven datos; las pantallas se declaran en Angular.
aplicacion.use('/api/auth', rutasAcceso);
aplicacion.use('/api/curriculums', requerir, rutasCurriculum);
aplicacion.use('/api/fotos', requerir, rutasFotos);
aplicacion.use('/api/perfil', requerir, rutasPerfil);
aplicacion.use('/api/usuarios', requerir, administrador, rutasUsuarios);

aplicacion.use((req, res) => {
    res.status(404).json({ mensaje: 'La dirección solicitada no existe.' });
});

// Los errores del acceso y la gestión de usuarios llegan acá desde el middleware.
aplicacion.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ mensaje: 'La petición supera 256 KB. Reducí la foto o el contenido de las secciones.' });
    }
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'Los datos JSON no son válidos.' });
    }
    if (error.status) {
        return res.status(error.status).json({ mensaje: error.message });
    }
    res.status(500).json({ mensaje: 'No se pudo completar la operación.' });
});

aplicacion.listen(puerto, direccion, () => {
    console.log('ArmaTuCV disponible en http://' + direccion + ':' + puerto);
});
