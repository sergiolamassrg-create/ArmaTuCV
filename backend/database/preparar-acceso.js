const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const argon2 = require('argon2');
const dotenv = require('dotenv');
(async () => {
    const archivo = path.join(__dirname, '..', '.env');
    let contenido = fs.readFileSync(archivo, 'utf8');
    const variables = dotenv.parse(contenido);
    if (!variables.SESSION_SECRET) {
        contenido = contenido.replace(/^SESSION_SECRET=.*$/m, '');
        contenido += '\nSESSION_SECRET=' + crypto.randomBytes(48).toString('hex');
    }
    if (!variables.CLAVE_HASH_COMPARACION) {
        contenido = contenido.replace(/^CLAVE_HASH_COMPARACION=.*$/m, '');
        const hash = await argon2.hash(crypto.randomBytes(32).toString('hex'), { type: argon2.argon2id });
        contenido += '\nCLAVE_HASH_COMPARACION=' + hash;
    }
    fs.writeFileSync(archivo, contenido.trimEnd() + '\n');
    console.log('Configuración de acceso preparada. No se muestran secretos.');
})().catch(() => { console.error('No se pudo preparar .env. Copiá primero .env.example y completá SQL.'); process.exitCode = 1; });
