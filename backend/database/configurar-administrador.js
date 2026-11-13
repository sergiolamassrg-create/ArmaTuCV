// Configuración inicial local, solo si todavía no hay administrador activo.
const sql = require('mssql');
const argon2 = require('argon2');
const { obtenerConexionSQL } = require('./conexion');
const { validarClave, validarCorreo } = require('../controllers/usuario-controlador').operaciones;
(async () => {
    try {
        let entrada = '';
        for await (const parte of process.stdin) entrada += parte;
        const datos = JSON.parse(entrada);
        const correo = validarCorreo(datos.email);
        if (typeof datos.nombre !== 'string' || !datos.nombre.trim() || datos.nombre.length > 100 ||
            typeof datos.apellido !== 'string' || !datos.apellido.trim() || datos.apellido.length > 100) {
            throw new Error('Completá nombre y apellido, hasta 100 caracteres cada uno.');
        }
        const hash = await argon2.hash(validarClave(datos.password), { type: argon2.argon2id });
        const conexion = await obtenerConexionSQL();
        await conexion.request().input('email',sql.NVarChar(150),correo)
            .input('nombre',sql.NVarChar(100),datos.nombre.trim()).input('apellido',sql.NVarChar(100),datos.apellido.trim())
            .input('hash',sql.NVarChar(255),hash).query(`SET XACT_ABORT ON;
                BEGIN TRANSACTION;
                IF EXISTS(SELECT id FROM dbo.Usuarios WITH(UPDLOCK,HOLDLOCK) WHERE rol='ADMIN' AND activo=1)
                BEGIN ROLLBACK; THROW 51000,N'Ya existe un administrador. Usá las cuentas demo o el panel de usuarios.',1; END;
                DECLARE @id INT=(SELECT id FROM dbo.Usuarios WHERE email=@email);
                IF @id IS NULL
                BEGIN
                    INSERT dbo.Usuarios(email,claveHash,rol) VALUES(@email,@hash,'ADMIN');
                    SET @id=SCOPE_IDENTITY();
                END
                ELSE UPDATE dbo.Usuarios SET claveHash=@hash,rol='ADMIN',activo=1,
                    versionSesion=versionSesion+1,modificadoEn=SYSUTCDATETIME() WHERE id=@id;
                IF EXISTS(SELECT id FROM dbo.Perfiles WHERE usuarioId=@id)
                    UPDATE dbo.Perfiles SET nombre=@nombre,apellido=@apellido WHERE usuarioId=@id;
                ELSE INSERT dbo.Perfiles(usuarioId,nombre,apellido) VALUES(@id,@nombre,@apellido);
                COMMIT;`);
        console.log('Administrador configurado.');
    } catch (error) {
        if (error.number === 51000 || error.status === 400 || error.message.startsWith('Completá nombre')) console.error(error.message);
        else console.error('No se pudo configurar el administrador. Revisá la base y los datos ingresados.');
        process.exitCode = 1;
    } finally { await sql.close(); }
})();
