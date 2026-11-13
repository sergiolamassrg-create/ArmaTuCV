// Implementación transitoria de Fase 2/3. En Fase 4 se separa el acceso SQL.
const repositorio = {};
const sql = require('mssql');
const { obtenerConexionSQL } = require('../database/conexion');
const consultas = require('../database/consultas');

repositorio.listar = async () => {
    const conexion = await obtenerConexionSQL();
    return (await conexion.request().query(consultas.listarUsuarios)).recordset;
};
repositorio.obtener = async (id) => {
    const conexion = await obtenerConexionSQL();
    return (await conexion.request().input('id', sql.Int, id).query(consultas.obtenerUsuario)).recordset[0];
};
repositorio.obtenerPorCorreo = async (correo) => {
    const conexion = await obtenerConexionSQL();
    return (await conexion.request().input('email', sql.NVarChar(150), correo).query(consultas.usuarioPorCorreo)).recordset[0];
};

async function guardar(usuario, id) {
    const conexion = await obtenerConexionSQL();
    const transaccion = new sql.Transaction(conexion);
    let revertida = false;
    transaccion.on('rollback', () => { revertida = true; });
    await transaccion.begin();
    try {
        const resultado = await new sql.Request(transaccion)
            .input('id', sql.Int, id ?? null)
            .input('email', sql.NVarChar(150), usuario.email)
            .input('claveHash', sql.NVarChar(255), usuario.claveHash)
            .input('rol', sql.VarChar(15), usuario.rol === 'administrador' ? 'ADMIN' : 'USUARIO')
            .input('activo', sql.Bit, usuario.activo)
            .query(id ? consultas.actualizarUsuario : consultas.crearUsuario);
        const guardado = resultado.recordset[0];
        if (!guardado) { await transaccion.rollback(); return undefined; }
        await new sql.Request(transaccion)
            .input('id', sql.Int, guardado.id)
            .input('nombre', sql.NVarChar(100), usuario.nombre)
            .input('apellido', sql.NVarChar(100), usuario.apellido)
            .query(id ? consultas.actualizarNombre : consultas.crearPerfil);
        await transaccion.commit();
        return await repositorio.obtener(guardado.id);
    } catch (error) {
        if (!revertida) await transaccion.rollback();
        throw error;
    }
}
repositorio.crear = async (usuario) => await guardar(usuario);
repositorio.actualizar = async (id, usuario) => await guardar(usuario, id);
repositorio.desactivar = async (id) => {
    const conexion = await obtenerConexionSQL();
    return (await conexion.request().input('id', sql.Int, id).query(consultas.desactivarUsuario)).rowsAffected[0];
};
repositorio.curriculums = async (id) => {
    const conexion = await obtenerConexionSQL();
    return (await conexion.request().input('id', sql.Int, id).query(consultas.curriculumsDeUsuario)).recordset;
};

const servicio = {};
const argon2 = require('argon2');
function errorDeUsuario(estado, mensaje) {
    const error = new Error(mensaje);
    error.status = estado;
    return error;
}
function validarId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero < 1 || numero > 2147483647) {
        throw errorDeUsuario(400, 'El identificador no es válido.');
    }
    return numero;
}
function validarCorreo(email) {
    if (typeof email !== 'string' || email.length > 150) {
        throw errorDeUsuario(400, 'Revisá el correo electrónico.');
    }
    const correo = email.trim().toLowerCase();
    const partes = correo.split('@');
    if (partes.length !== 2 || partes[0].trim() === '' || partes[1].trim() === '' || correo.includes(' ')) {
        throw errorDeUsuario(400, 'Revisá el correo electrónico.');
    }
    return correo;
}
function validarClave(clave) {
    if (typeof clave !== 'string' || clave.length < 12 || clave.length > 128 || clave.trim() === '') {
        throw errorDeUsuario(400, 'La contraseña debe tener entre 12 y 128 caracteres.');
    }
    return clave;
}
function datosPublicos(usuario) {
    return { id: usuario.id, nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol, activo: usuario.activo };
}
function prepararDatos(datos, registro) {
    if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw errorDeUsuario(400, 'Datos inválidos.');
    const permitidos = registro ? ['nombre', 'apellido', 'email', 'password'] : ['nombre', 'apellido', 'email', 'password', 'rol', 'activo'];
    for (const campo of Object.keys(datos)) {
        if (!permitidos.includes(campo)) throw errorDeUsuario(400, 'El formulario contiene un campo no permitido.');
    }
    if (typeof datos.nombre !== 'string' || !datos.nombre.trim() || datos.nombre.length > 100 ||
        typeof datos.apellido !== 'string' || !datos.apellido.trim() || datos.apellido.length > 100) {
        throw errorDeUsuario(400, 'Completá nombre y apellido, hasta 100 caracteres cada uno.');
    }
    const usuario = { nombre: datos.nombre.trim(), apellido: datos.apellido.trim(), email: validarCorreo(datos.email), rol: 'usuario', activo: true };
    if (!registro) {
        if (!['usuario', 'administrador'].includes(datos.rol) || typeof datos.activo !== 'boolean') {
            throw errorDeUsuario(400, 'Revisá el rol y el estado de la cuenta.');
        }
        usuario.rol = datos.rol;
        usuario.activo = datos.activo;
    }
    return usuario;
}
function comprobarDuplicado(error) {
    if (error.number === 2601 || error.number === 2627) throw errorDeUsuario(409, 'Ya existe una cuenta con ese correo.');
    throw error;
}
async function guardarUsuarioNuevo(datos, registroPublico) {
    const usuario = prepararDatos(datos, registroPublico);
    usuario.claveHash = await argon2.hash(validarClave(datos.password), { type: argon2.argon2id });
    try {
        return datosPublicos(await repositorio.crear(usuario));
    } catch (error) {
        comprobarDuplicado(error);
    }
}
// El registro público fija el rol usuario; el alta administrativa permite elegirlo.
servicio.registrar = async (datos) => await guardarUsuarioNuevo(datos, true);
servicio.crear = async (datos) => await guardarUsuarioNuevo(datos, false);
servicio.ingresar = async (datos) => {
    const correo = validarCorreo(datos && datos.email);
    const clave = datos && datos.password;
    if (typeof clave !== 'string' || clave.length < 1 || clave.length > 128) {
        throw errorDeUsuario(401, 'Correo o contraseña incorrectos.');
    }
    const usuario = await repositorio.obtenerPorCorreo(correo);
    // También se verifica un hash cuando la cuenta no existe, para no responder inmediatamente.
    const hash = usuario && usuario.claveHash ? usuario.claveHash : process.env.CLAVE_HASH_COMPARACION;
    const coincide = await argon2.verify(hash, clave);
    if (!usuario || !usuario.activo || !usuario.claveHash || !coincide) {
        throw errorDeUsuario(401, 'Correo o contraseña incorrectos.');
    }
    return usuario;
};
servicio.listar = async () => await repositorio.listar();
servicio.obtener = async (id) => {
    const usuario = await repositorio.obtener(validarId(id));
    if (!usuario) throw errorDeUsuario(404, 'El usuario no existe.');
    return datosPublicos(usuario);
};
servicio.actualizar = async (id, datos, administradorId) => {
    const identificador = validarId(id);
    const usuario = prepararDatos(datos, false);
    if (identificador === administradorId && (usuario.rol !== 'administrador' || !usuario.activo)) {
        throw errorDeUsuario(400, 'No podés quitarte el permiso de administrador ni desactivar tu propia cuenta.');
    }
    usuario.claveHash = null;
    if (datos.password !== undefined && datos.password !== '') {
        usuario.claveHash = await argon2.hash(validarClave(datos.password), { type: argon2.argon2id });
    }
    try {
        const resultado = await repositorio.actualizar(identificador, usuario);
        if (!resultado) throw errorDeUsuario(404, 'El usuario no existe.');
        return datosPublicos(resultado);
    } catch (error) { comprobarDuplicado(error); }
};
servicio.desactivar = async (id, administradorId) => {
    const identificador = validarId(id);
    if (identificador === administradorId) throw errorDeUsuario(400, 'No podés desactivar tu propia cuenta.');
    if (!await repositorio.desactivar(identificador)) throw errorDeUsuario(404, 'El usuario no existe.');
};
servicio.curriculums = async (id) => {
    const identificador = validarId(id);
    await servicio.obtener(identificador);
    return await repositorio.curriculums(identificador);
};
servicio.datosPublicos = datosPublicos;
servicio.validarClave = validarClave;
servicio.validarCorreo = validarCorreo;


exports.listar = async (req, res, next) => {
    try {
        res.json(await servicio.listar());
    } catch (error) {
        next(error);
    }
};
exports.obtener = async (req, res, next) => {
    try {
        res.json(await servicio.obtener(req.params.id));
    } catch (error) {
        next(error);
    }
};
exports.crear = async (req, res, next) => {
    try {
        res.status(201).json(await servicio.crear(req.body));
    } catch (error) {
        next(error);
    }
};

// Exportaciones temporales para autenticación hasta incorporar Service.
exports.operaciones = servicio;
exports.consultarCuenta = repositorio.obtener;
