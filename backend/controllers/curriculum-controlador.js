// Implementación transitoria de Fase 2/3. En Fase 4 se separa el acceso SQL.
const repositorio = {};
const sql = require('mssql');
const { obtenerConexionSQL } = require('../database/conexion');
const consultas = require('../database/consultas');

// Solo metadatos definidos por el programa; nunca nombres SQL recibidos del usuario.
const secciones = [
    { campo: 'experiencias', consulta: consultas.insertarExperiencia, parametros: {
        puesto: sql.NVarChar(150), empresa: sql.NVarChar(150), fechaInicio: sql.Date, fechaFin: sql.Date, descripcion: sql.NVarChar(2000) } },
    { campo: 'educaciones', consulta: consultas.insertarEducacion, parametros: {
        titulo: sql.NVarChar(200), institucion: sql.NVarChar(200), anioInicio: sql.SmallInt, anioFin: sql.SmallInt, estado: sql.NVarChar(40) } },
    { campo: 'habilidades', consulta: consultas.insertarHabilidad, parametros: { nombre: sql.NVarChar(120), tipo: sql.VarChar(10) } },
    { campo: 'idiomas', consulta: consultas.insertarIdioma, parametros: { idioma: sql.NVarChar(80), nivel: sql.NVarChar(60) } },
    { campo: 'complementos', consulta: consultas.insertarComplemento, parametros: {
        tipo: sql.VarChar(15), titulo: sql.NVarChar(200), descripcion: sql.NVarChar(2000), anio: sql.SmallInt } }
];
repositorio.listar = async (usuarioId) => {
    const conexion = await obtenerConexionSQL();
    return (await conexion.request().input('usuarioId', sql.Int, usuarioId).query(consultas.listarCurriculums)).recordset;
};
repositorio.obtener = async (id, usuarioId) => {
    const conexion = await obtenerConexionSQL();
    const resultado = await conexion.request().input('id', sql.Int, id)
        .input('usuarioId', sql.Int, usuarioId).query(consultas.obtenerCurriculum);
    const curriculum = resultado.recordsets[0][0];
    if (!curriculum) return undefined;
    curriculum.foto = curriculum.foto ? 'data:image/jpeg;base64,' + curriculum.foto.toString('base64') : '';
    for (const campo of ['linkedin', 'github', 'portfolio']) {
        if (curriculum[campo] && !curriculum[campo].startsWith('https://') && !curriculum[campo].startsWith('http://')) curriculum[campo] = 'https://' + curriculum[campo];
    }
    for (let indice = 0; indice < secciones.length; indice++) {
        curriculum[secciones[indice].campo] = resultado.recordsets[indice + 1];
    }
    return curriculum;
};
async function guardar(curriculum, usuarioId, id) {
    const conexion = await obtenerConexionSQL();
    const transaccion = new sql.Transaction(conexion);
    let revertida = false;
    transaccion.on('rollback', () => { revertida = true; });
    await transaccion.begin();
    try {
        const resultado = await new sql.Request(transaccion)
            .input('id', sql.Int, id ?? null).input('usuarioId', sql.Int, usuarioId)
            .input('titulo', sql.NVarChar(150), curriculum.titulo).input('puesto', sql.NVarChar(180), curriculum.puesto)
            .input('resumen', sql.NVarChar(2000), curriculum.resumen)
            .input('fotoId', sql.Int, curriculum.fotoId).input('plantilla', sql.NVarChar(8), curriculum.plantilla)
            .input('tamanoLetra', sql.Decimal(3, 1), curriculum.tamanoLetra).input('mostrarIconos', sql.Bit, curriculum.mostrarIconos)
            .query(id ? consultas.actualizarCurriculum : consultas.crearCurriculum);
        const guardado = resultado.recordset[0];
        if (!guardado) { await transaccion.rollback(); return undefined; }
        await new sql.Request(transaccion).input('id', sql.Int, guardado.id).query(consultas.eliminarSecciones);
        for (const seccion of secciones) {
            for (const registro of curriculum[seccion.campo]) {
                const peticion = new sql.Request(transaccion).input('curriculumId', sql.Int, guardado.id);
                for (const campo of Object.keys(seccion.parametros)) {
                    peticion.input(campo, seccion.parametros[campo], registro[campo]);
                }
                await peticion.query(seccion.consulta);
            }
        }
        await transaccion.commit();
        return await repositorio.obtener(guardado.id, usuarioId);
    } catch (error) {
        if (!revertida) await transaccion.rollback();
        throw error;
    }
}
repositorio.crear = async (curriculum, usuarioId) => await guardar(curriculum, usuarioId);
repositorio.actualizar = async (id, curriculum, usuarioId) => await guardar(curriculum, usuarioId, id);
repositorio.eliminar = async (id, usuarioId) => {
    const conexion = await obtenerConexionSQL();
    return (await conexion.request().input('id', sql.Int, id).input('usuarioId', sql.Int, usuarioId)
        .query(consultas.eliminarCurriculum)).rowsAffected[0];
};

const servicio = {};
function errorDeDatos(mensaje) {
    const error = new Error(mensaje);
    error.status = 400;
    return error;
}
function validarId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero < 1 || numero > 2147483647) throw errorDeDatos('El identificador no es válido.');
    return numero;
}
function texto(valor, limite, nombre, obligatorio = false) {
    if (valor === undefined || valor === null) valor = '';
    if (typeof valor !== 'string' || valor.length > limite || (obligatorio && !valor.trim())) {
        throw errorDeDatos('Revisá ' + nombre + ' (máximo ' + limite + ' caracteres).');
    }
    return valor.trim();
}
function fecha(valor) {
    if (valor === '' || valor === null || valor === undefined) return null;
    if (typeof valor !== 'string' || valor.length !== 10) throw errorDeDatos('Usá fechas válidas con formato año-mes-día.');
    const resultado = new Date(valor + 'T00:00:00Z');
    if (Number.isNaN(resultado.getTime()) || resultado.toISOString().slice(0, 10) !== valor || valor < '0001-01-01') {
        throw errorDeDatos('La fecha no es válida.');
    }
    return valor;
}
function anio(valor) {
    if (valor === '' || valor === null || valor === undefined) return null;
    if (!Number.isInteger(valor) || valor < 1900 || valor > 2100) throw errorDeDatos('El año debe estar entre 1900 y 2100.');
    return valor;
}
function registros(datos, campo, preparar) {
    const lista = datos[campo] ?? [];
    if (!Array.isArray(lista) || lista.length > 20) throw errorDeDatos('Cada sección admite hasta 20 registros.');
    return lista.map(registro => {
        if (!registro || typeof registro !== 'object' || Array.isArray(registro)) throw errorDeDatos('Revisá los registros de ' + campo + '.');
        return preparar(registro);
    });
}
function prepararDatos(datos) {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw errorDeDatos('Revisá el formulario.');
    const permitidos = ['titulo','puesto','resumen','experiencias','educaciones','habilidades','idiomas','complementos',
        'fotoId','plantilla','tamanoLetra','mostrarIconos'];
    for (const campo of Object.keys(datos)) {
        if (!permitidos.includes(campo)) throw errorDeDatos('El formulario contiene un campo no permitido.');
    }
    const cv = {
        titulo: texto(datos.titulo,150,'el título',true),
        puesto: texto(datos.puesto,180,'el puesto objetivo',true),
        resumen: texto(datos.resumen,2000,'el resumen'),
        fotoId: datos.fotoId ?? null, plantilla: datos.plantilla ?? 'sin-foto',
        tamanoLetra: datos.tamanoLetra ?? 11, mostrarIconos: datos.mostrarIconos ?? false
    };
    if (!['sin-foto','con-foto'].includes(cv.plantilla) || ![10,10.5,11,11.5,12].includes(cv.tamanoLetra) ||
        typeof cv.mostrarIconos !== 'boolean') throw errorDeDatos('Revisá las opciones de diseño.');
    if (cv.fotoId !== null && (typeof cv.fotoId !== 'number' || validarId(cv.fotoId) !== cv.fotoId)) throw errorDeDatos('Elegí una foto válida.');
    if (cv.plantilla === 'con-foto' && cv.fotoId === null) throw errorDeDatos('Elegí una foto o usá Sin foto.');
    if (cv.plantilla === 'sin-foto') cv.fotoId = null;
    cv.experiencias = registros(datos,'experiencias', r => {
        const experiencia = { puesto: texto(r.puesto,150,'el puesto',true), empresa: texto(r.empresa,150,'la empresa',true),
            fechaInicio: fecha(r.fechaInicio), fechaFin: fecha(r.fechaFin), descripcion: texto(r.descripcion,2000,'la descripción') };
        if (experiencia.fechaInicio && experiencia.fechaFin && experiencia.fechaFin < experiencia.fechaInicio) throw errorDeDatos('La fecha de fin no puede ser anterior al inicio.');
        return experiencia;
    });
    cv.educaciones = registros(datos,'educaciones', r => {
        const educacion = { titulo: texto(r.titulo,200,'el título de estudio',true), institucion: texto(r.institucion,200,'la institución',true),
            anioInicio: anio(r.anioInicio), anioFin: anio(r.anioFin), estado: texto(r.estado,40,'el estado') };
        if (educacion.anioInicio && educacion.anioFin && educacion.anioFin < educacion.anioInicio) throw errorDeDatos('El año de fin no puede ser anterior al inicio.');
        return educacion;
    });
    cv.habilidades = registros(datos,'habilidades', r => {
        if (!['TECNICA','BLANDA'].includes(r.tipo)) throw errorDeDatos('Elegí el tipo de habilidad.');
        return { nombre: texto(r.nombre,120,'la habilidad',true), tipo: r.tipo };
    });
    cv.idiomas = registros(datos,'idiomas', r => ({ idioma: texto(r.idioma,80,'el idioma',true), nivel: texto(r.nivel,60,'el nivel',true) }));
    cv.complementos = registros(datos,'complementos', r => {
        if (!['CURSO','CERTIFICACION','PROYECTO'].includes(r.tipo)) throw errorDeDatos('Elegí el tipo de complemento.');
        return { tipo: r.tipo, titulo: texto(r.titulo,200,'el título del complemento',true),
            descripcion: texto(r.descripcion,2000,'la descripción'), anio: anio(r.anio) };
    });
    return cv;
}
async function guardar(datos, usuarioId, id) {
    const cv = prepararDatos(datos);
    try { return id ? await repositorio.actualizar(id,cv,usuarioId) : await repositorio.crear(cv,usuarioId); }
    catch (error) {
        if (error.number === 51002 || error.number === 547) throw errorDeDatos('La foto no está disponible en tu biblioteca.');
        if (error.number === 51003) throw errorDeDatos('Completá tus datos personales antes de crear un CV.');
        throw error;
    }
}
servicio.listar = async (usuarioId) => await repositorio.listar(usuarioId);
servicio.obtener = async (id,usuarioId) => await repositorio.obtener(validarId(id),usuarioId);
servicio.crear = async (datos,usuarioId) => await guardar(datos,usuarioId);
servicio.actualizar = async (id,datos,usuarioId) => await guardar(datos,usuarioId,validarId(id));
servicio.eliminar = async (id,usuarioId) => await repositorio.eliminar(validarId(id),usuarioId);


exports.listar = async (req, res) => {
    try {
        const curriculums = await servicio.listar(res.locals.usuario.id);
        res.status(200).json(curriculums);
    } catch (error) {
        res.status(500).json({ mensaje: 'No se pudieron consultar los currículums.' });
    }
};

exports.obtener = async (req, res) => {
    try {
        const curriculum = await servicio.obtener(req.params.id, res.locals.usuario.id);
        if (!curriculum) {
            return res.status(404).json({ mensaje: 'El currículum no existe.' });
        }
        res.status(200).json(curriculum);
    } catch (error) {
        if (error.status === 400) {
            return res.status(400).json({ mensaje: error.message });
        }
        res.status(500).json({ mensaje: 'No se pudo consultar el currículum.' });
    }
};

exports.crear = async (req, res) => {
    try {
        const curriculum = await servicio.crear(req.body, res.locals.usuario.id);
        res.status(201).json(curriculum);
    } catch (error) {
        if (error.status === 400) {
            return res.status(400).json({ mensaje: error.message });
        }
        res.status(500).json({ mensaje: 'No se pudo guardar el currículum.' });
    }
};