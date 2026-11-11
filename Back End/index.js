const express = require('express');

const aplicacion = express();
const direccion = process.env.HOST || '127.0.0.1';
const puerto = Number(process.env.PORT || 3000);

aplicacion.use(express.json());

aplicacion.use((req, res) => {
    res.status(404).json({ mensaje: 'La dirección solicitada no existe.' });
});

aplicacion.use((error, req, res, next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ mensaje: 'Los datos JSON no son válidos.' });
    }
    res.status(500).json({ mensaje: 'No se pudo completar la operación.' });
});

aplicacion.listen(puerto, direccion, () => {
    console.log('ArmaTuCV disponible en http://' + direccion + ':' + puerto);
});
