const seleccionarUsuario = `SELECT u.id,COALESCE(p.nombre,N'') AS nombre,COALESCE(p.apellido,N'') AS apellido,
    u.email,CASE u.rol WHEN 'ADMIN' THEN 'administrador' ELSE 'usuario' END AS rol,
    u.activo,u.creadoEn,u.modificadoEn
    FROM dbo.Usuarios u LEFT JOIN dbo.Perfiles p ON p.usuarioId=u.id`;

const seleccionarPerfil = `SELECT p.id,p.nombre,p.apellido,u.email,COALESCE(p.telefono,N'') AS telefono,
    COALESCE(p.ubicacion,N'') AS ubicacion,COALESCE(p.linkedin,N'') AS linkedin,
    COALESCE(p.github,N'') AS github,COALESCE(p.portfolio,N'') AS portfolio
    FROM dbo.Perfiles p JOIN dbo.Usuarios u ON u.id=p.usuarioId`;

const seleccionarCurriculum = `SELECT c.id,c.perfilId,p.usuarioId,c.titulo,c.puesto,COALESCE(c.resumen,N'') AS resumen,
    CONCAT(p.nombre,N' ',p.apellido) AS nombreCompleto,u.email,
    COALESCE(p.telefono,N'') AS telefono,COALESCE(p.ubicacion,N'') AS ubicacion,
    COALESCE(p.linkedin,N'') AS linkedin,COALESCE(p.github,N'') AS github,COALESCE(p.portfolio,N'') AS portfolio,
    c.tamanoLetra,c.mostrarIconos
    FROM dbo.Curriculums c JOIN dbo.Perfiles p ON p.id=c.perfilId
    JOIN dbo.Usuarios u ON u.id=p.usuarioId`;

module.exports = {
  obtenerPerfil: `${seleccionarPerfil} WHERE p.usuarioId=@usuarioId`,

  actualizarPerfil: `UPDATE dbo.Perfiles SET nombre=@nombre,apellido=@apellido,telefono=@telefono,
        ubicacion=@ubicacion,linkedin=@linkedin,github=@github,portfolio=@portfolio WHERE usuarioId=@usuarioId`,

  listarCurriculums: `SELECT c.id,c.titulo,CONCAT(p.nombre,N' ',p.apellido) AS nombreCompleto
        FROM dbo.Curriculums c JOIN dbo.Perfiles p ON p.id=c.perfilId WHERE p.usuarioId=@usuarioId ORDER BY c.id DESC`,

  obtenerCurriculum: `DECLARE @curriculumId INT=(SELECT c.id FROM dbo.Curriculums c JOIN dbo.Perfiles p ON p.id=c.perfilId
            WHERE c.id=@id AND (p.usuarioId=@usuarioId OR @esAdministrador=1));
        ${seleccionarCurriculum} WHERE c.id=@curriculumId;
        SELECT id,puesto,empresa,CONVERT(VARCHAR(10),fechaInicio,23) AS fechaInicio,
            CONVERT(VARCHAR(10),fechaFin,23) AS fechaFin,COALESCE(descripcion,N'') AS descripcion
            FROM dbo.Experiencias WHERE curriculumId=@curriculumId ORDER BY id;
        SELECT id,titulo,institucion,anioInicio,anioFin,COALESCE(estado,N'') AS estado
            FROM dbo.Educaciones WHERE curriculumId=@curriculumId ORDER BY id;
        SELECT id,nombre,tipo FROM dbo.Habilidades WHERE curriculumId=@curriculumId ORDER BY id;
        SELECT id,idioma,nivel FROM dbo.Idiomas WHERE curriculumId=@curriculumId ORDER BY id;
        SELECT id,tipo,titulo,COALESCE(descripcion,N'') AS descripcion,anio
            FROM dbo.Complementos WHERE curriculumId=@curriculumId ORDER BY id`,

  // Compatibilidad con la columna histórica NOT NULL; no es una opción de la API.
  crearCurriculum: `DECLARE @perfilId INT=(SELECT id FROM dbo.Perfiles WHERE usuarioId=@usuarioId);
        IF @perfilId IS NULL THROW 51003,N'Completá tus datos personales antes de crear un CV.',1;
        INSERT dbo.Curriculums(perfilId,titulo,puesto,resumen,plantilla,tamanoLetra,mostrarIconos)
        OUTPUT INSERTED.id VALUES(@perfilId,@titulo,@puesto,@resumen,N'sin-foto',@tamanoLetra,@mostrarIconos)`,

  actualizarCurriculum: `UPDATE c SET titulo=@titulo,puesto=@puesto,resumen=@resumen,
            tamanoLetra=@tamanoLetra,mostrarIconos=@mostrarIconos,actualizadoEn=SYSUTCDATETIME()
        OUTPUT INSERTED.id FROM dbo.Curriculums c JOIN dbo.Perfiles p ON p.id=c.perfilId
        WHERE c.id=@id AND p.usuarioId=@usuarioId`,

  eliminarSecciones: `DELETE dbo.Experiencias WHERE curriculumId=@id;
        DELETE dbo.Educaciones WHERE curriculumId=@id; DELETE dbo.Habilidades WHERE curriculumId=@id;
        DELETE dbo.Idiomas WHERE curriculumId=@id; DELETE dbo.Complementos WHERE curriculumId=@id;`,

  insertarExperiencia: `INSERT dbo.Experiencias(curriculumId,puesto,empresa,fechaInicio,fechaFin,descripcion)
        VALUES(@curriculumId,@puesto,@empresa,@fechaInicio,@fechaFin,@descripcion)`,

  insertarEducacion: `INSERT dbo.Educaciones(curriculumId,titulo,institucion,anioInicio,anioFin,estado)
        VALUES(@curriculumId,@titulo,@institucion,@anioInicio,@anioFin,@estado)`,

  insertarHabilidad:
    'INSERT dbo.Habilidades(curriculumId,nombre,tipo) VALUES(@curriculumId,@nombre,@tipo)',

  insertarIdioma:
    'INSERT dbo.Idiomas(curriculumId,idioma,nivel) VALUES(@curriculumId,@idioma,@nivel)',

  insertarComplemento: `INSERT dbo.Complementos(curriculumId,tipo,titulo,descripcion,anio)
        VALUES(@curriculumId,@tipo,@titulo,@descripcion,@anio)`,

  eliminarCurriculum: `DELETE c FROM dbo.Curriculums c JOIN dbo.Perfiles p ON p.id=c.perfilId
        WHERE c.id=@id AND p.usuarioId=@usuarioId`,

  listarUsuarios: `SELECT u.id,COALESCE(p.nombre,N'') AS nombre,COALESCE(p.apellido,N'') AS apellido,
        u.email,CASE u.rol WHEN 'ADMIN' THEN 'administrador' ELSE 'usuario' END AS rol,
        u.activo,u.creadoEn,u.modificadoEn,

        (SELECT COUNT(*) FROM dbo.Curriculums c WHERE c.perfilId=p.id) AS cantidadCV
        FROM dbo.Usuarios u LEFT JOIN dbo.Perfiles p ON p.usuarioId=u.id ORDER BY u.id`,

  obtenerUsuario: `${seleccionarUsuario} WHERE u.id=@id`,

  usuarioPorCorreo: `${seleccionarUsuario.replace('SELECT u.id,', 'SELECT u.claveHash,u.id,')} WHERE u.email=@email`,

  crearUsuario: `INSERT dbo.Usuarios(email,claveHash,rol,activo)
        OUTPUT INSERTED.id VALUES(@email,@claveHash,@rol,@activo)`,

  crearPerfil: 'INSERT dbo.Perfiles(usuarioId,nombre,apellido) VALUES(@id,@nombre,@apellido)',

  actualizarUsuario: `UPDATE dbo.Usuarios SET email=@email,rol=@rol,activo=@activo,
        claveHash=COALESCE(@claveHash,claveHash),modificadoEn=SYSUTCDATETIME()
        OUTPUT INSERTED.id WHERE id=@id`,

  actualizarNombre: 'UPDATE dbo.Perfiles SET nombre=@nombre,apellido=@apellido WHERE usuarioId=@id',

  desactivarUsuario:
    'UPDATE dbo.Usuarios SET activo=0,modificadoEn=SYSUTCDATETIME() WHERE id=@id',

  curriculumsDeUsuario: `SELECT c.id,c.titulo,c.creadoEn,c.actualizadoEn AS modificadoEn
        FROM dbo.Curriculums c JOIN dbo.Perfiles p ON p.id=c.perfilId WHERE p.usuarioId=@id ORDER BY c.id DESC`,
};
