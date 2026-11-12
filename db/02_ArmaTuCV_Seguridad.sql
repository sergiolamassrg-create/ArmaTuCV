
/*
========================================================
 ARMATUCV - SEGURIDAD Y PERMISOS
========================================================

REQUISITOS:
1. Ejecutar primero 01_ArmaTuCV_BaseDatos.sql.
2. Abrir este script en SSMS como administrador.
3. Elegir una contraseña privada y segura.

CONTRASEÑA:
- Recomendado: entre 12 y 32 caracteres.
- Usar mayúsculas, minúsculas, números y símbolos.
- La política de Windows puede exigir otras reglas.
- Reemplazar CAMBIAR_POR_TU_CLAVE_SEGURA en @Clave.
- Utilizar la misma contraseña en DB_PASSWORD del .env.
- No publicar contraseñas reales en GitHub.

Si el LOGIN ya existe, su contraseña no se modifica.
========================================================
*/

-- PASO 1: CREAR LOGIN
USE [master];
GO

IF SUSER_ID(N'armatucv_app') IS NULL
BEGIN
    DECLARE @Clave nvarchar(128) =
        N'CAMBIAR_POR_TU_CLAVE_SEGURA';

    IF @Clave = N'CAMBIAR_POR_TU_CLAVE_SEGURA'
        THROW 51001,
            N'Debes configurar una clave privada en @Clave.',
            1;

    DECLARE @Sql nvarchar(max) =
        N'CREATE LOGIN [armatucv_app] WITH PASSWORD = N'''
        + REPLACE(@Clave, NCHAR(39), NCHAR(39) + NCHAR(39))
        + N''', CHECK_POLICY = ON;';

    EXEC sys.sp_executesql @Sql;
END;
GO

-- PASO 2: CREAR USUARIO DE BASE DE DATOS
USE [armatucvprod];
GO

IF USER_ID(N'armatucv_app') IS NULL
BEGIN
    CREATE USER [armatucv_app]
    FOR LOGIN [armatucv_app];
END;
GO

-- PASO 3: ASIGNAR PERMISOS

GRANT SELECT, INSERT, UPDATE
ON dbo.Usuarios TO [armatucv_app];

GRANT SELECT, INSERT, UPDATE
ON dbo.Perfiles TO [armatucv_app];

GRANT SELECT, INSERT, UPDATE, DELETE
ON dbo.Curriculums TO [armatucv_app];

GRANT SELECT, INSERT, UPDATE, DELETE
ON dbo.Experiencias TO [armatucv_app];

GRANT SELECT, INSERT, UPDATE, DELETE
ON dbo.Educaciones TO [armatucv_app];

GRANT SELECT, INSERT, UPDATE, DELETE
ON dbo.Habilidades TO [armatucv_app];

GRANT SELECT, INSERT, UPDATE, DELETE
ON dbo.Idiomas TO [armatucv_app];

GRANT SELECT, INSERT, UPDATE, DELETE
ON dbo.Complementos TO [armatucv_app];

GRANT SELECT, INSERT, DELETE
ON dbo.Fotos TO [armatucv_app];
GO

PRINT N'Permisos de armatucv_app configurados.';
GO
