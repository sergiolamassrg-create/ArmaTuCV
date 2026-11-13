ARMATUCV - GUIA DE INSTALACION LOCAL (SQL SERVER)
=================================================

ARCHIVOS
1) 01_ArmaTuCV_BaseDatos.sql: exportacion original de la base con las 9 tablas y datos de prueba.
2) 02_ArmaTuCV_Seguridad.sql: LOGIN tecnico, usuario de base de datos y permisos.

REQUISITOS
- SQL Server con autenticacion SQL Server habilitada (modo mixto).
- SQL Server Management Studio (SSMS).
- Acceso a SQL Server con permisos para crear bases de datos y LOGINs, y conceder permisos.
- Backend Express de ArmaTuCV.

PASO 1 - BASE DE DATOS
Abrir 01_ArmaTuCV_BaseDatos.sql en SSMS y ejecutarlo (F5) sobre una instalacion limpia.
IMPORTANTE: el script exportado originalmente empieza con USE [armatucvprod];
por lo tanto la base armatucvprod debe existir antes de ejecutarlo.
Si todavia no existe, crearla en SSMS (Bases de datos > Nueva base de datos > armatucvprod)
o ejecutar en una consulta nueva:

USE master;
GO
CREATE DATABASE [armatucvprod];
GO

No ejecutar el script de creacion de tablas nuevamente sobre una base que ya las tiene.

PASO 2 - SEGURIDAD
Abrir una COPIA LOCAL de 02_ArmaTuCV_Seguridad.sql.
En la linea DECLARE @Clave nvarchar(128) = N'CAMBIAR_POR_TU_CLAVE_SEGURA';
reemplazar CAMBIAR_POR_TU_CLAVE_SEGURA por la contraseña privada, conservando
las comillas. Esta es la UNICA linea que debe editarse.
Si la contraseña incluye comilla simple ('), duplicarla como ('') en el literal SQL.
El script evita crear el LOGIN si se deja la contraseña de ejemplo.
Ejecutar el script con F5 conectado como administrador.

REGLAS DE CONTRASEÑA
- Recomendacion del proyecto: entre 12 y 32 caracteres, con mayusculas, minusculas,
  numeros y simbolos, sin nombres ni claves comunes.
- CHECK_POLICY = ON: SQL Server aplica la politica de contraseñas de Windows de ese equipo.
  El minimo efectivo y las exigencias adicionales dependen de esa politica; SQL Server
  admite hasta 128 caracteres para la contraseña del LOGIN.
- Cada integrante puede utilizar una clave diferente.
- Si armatucv_app ya existe, el script NO cambia su contraseña. Utilizar la existente
  o cambiarla expresamente con una cuenta autorizada.

PASO 3 - BACKEND EXPRESS
En el archivo .env LOCAL del backend, configurar las variables con los nombres
que realmente usa el proyecto. Ejemplo (ajustar servidor y puerto de cada equipo):

DB_SERVER=127.0.0.1
DB_PORT=14330
DB_NAME=armatucvprod
DB_USER=armatucv_app
DB_PASSWORD=LA_MISMA_CONTRASEÑA_CONFIGURADA_EN_SQL_SERVER

El .env no debe subirse a GitHub. Mantener .env en .gitignore.
Compartir solamente un .env.example sin secretos.

PASO 4 - COMPROBACION
Iniciar Express y probar una operacion de lectura contra la base.
Verificar que se muestran los usuarios y CV de prueba.
Si aparece 'Login failed', revisar autenticacion mixta, usuario, clave, puerto e instancia.
Si aparece 'permission denied', revisar la ejecucion del script de seguridad.

NOTAS
- armatucv_app es el usuario tecnico del backend, NO un usuario que inicia sesion en la web.
- Los usuarios de prueba de la aplicacion ya estan en la tabla dbo.Usuarios del primer script.
- El script de seguridad conserva los permisos originales, incluida la ausencia de UPDATE en Fotos.
- No distribuir copias del SQL con contraseñas reales incorporadas.