const sql = require('mssql');
const { configuracion } = require('./config');

async function obtenerConexionSQL() {
    const conexion = await sql.connect(configuracion);
    return conexion;
}

sql.on('error', () => {
    console.error('Se produjo un error en la conexión con SQL Server.');
});

module.exports = { obtenerConexionSQL };
