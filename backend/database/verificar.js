const sql = require('mssql');
const { obtenerConexionSQL } = require('./conexion');
(async () => {
    try {
        const conexion = await obtenerConexionSQL();
        const base = (await conexion.request().query('SELECT DB_NAME() AS nombre')).recordset[0].nombre;
        if (base !== 'armatucvprod') throw new Error('La conexión no corresponde a armatucvprod.');
        await conexion.request().query(`SELECT TOP(0) u.id,u.claveHash,u.versionSesion,p.nombre,p.apellido,
            c.puesto,c.fotoId,c.plantilla,c.tamanoLetra,c.mostrarIconos
            FROM dbo.Usuarios u JOIN dbo.Perfiles p ON p.usuarioId=u.id
            LEFT JOIN dbo.Curriculums c ON c.perfilId=p.id;
            SELECT TOP(0) id,contenido FROM dbo.Fotos;
            SELECT TOP(0) id FROM dbo.Experiencias; SELECT TOP(0) id FROM dbo.Educaciones;
            SELECT TOP(0) id FROM dbo.Habilidades; SELECT TOP(0) id FROM dbo.Idiomas;
            SELECT TOP(0) id FROM dbo.Complementos;`);
        console.log('Conexión y nueve tablas de armatucvprod verificadas. No se modificaron datos.');
    } catch {
        console.error('No se pudo verificar la base. Revisá .env y los scripts de la carpeta db.');
        process.exitCode = 1;
    } finally { await sql.close(); }
})();
