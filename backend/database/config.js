const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });

if (process.env.DB_NAME !== 'armatucvprod') {
    throw new Error('Configurá DB_NAME=armatucvprod. Esta aplicación solo utiliza esa base.');
}

const configuracion = {
    server: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true'
    }
};

module.exports = { configuracion };
