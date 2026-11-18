require('./config');

const sesionValida = process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 32;

if (!sesionValida) {
  console.error('Falta completar SESSION_SECRET en .env.');
  console.error('Seguí los pasos manuales indicados en backend/.env.example.');
  process.exitCode = 1;
} else {
  console.log('Configuración de acceso completa. No se muestran secretos.');
}
