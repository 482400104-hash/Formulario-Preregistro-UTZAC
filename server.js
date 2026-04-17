import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3001;
let registros = [];

// Cargar registros del archivo JSON
const registrosPath = path.join(__dirname, 'registros.json');
const cargarRegistros = () => {
  try {
    if (fs.existsSync(registrosPath)) {
      const data = fs.readFileSync(registrosPath, 'utf-8');
      registros = JSON.parse(data);
    } else {
      registros = [];
    }
  } catch (error) {
    console.error('Error cargando registros:', error.message);
    registros = [];
  }
};

// Guardar registros al archivo JSON
const guardarRegistros = () => {
  try {
    fs.writeFileSync(registrosPath, JSON.stringify(registros, null, 2));
  } catch (error) {
    console.error('Error guardando registros:', error.message);
  }
};

// Cargar registros al iniciar
cargarRegistros();

// Crear servidor
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // POST /api/registrar
  if (req.method === 'POST' && req.url === '/api/registrar') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const { nombre, email, telefono, escuela, carrera, tipo } = data;

        if (!nombre || !email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Nombre y email son requeridos' }));
          return;
        }

        // Verificar si el email ya existe
        if (registros.some(r => r.email === email)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Este email ya está registrado' }));
          return;
        }

        const newRegistro = {
          id: registros.length + 1,
          nombre,
          email,
          telefono: telefono || '',
          escuela: escuela || '',
          carrera: carrera || '',
          tipo: tipo || 'estudiante',
          fecha_registro: new Date().toISOString()
        };

        registros.push(newRegistro);
        guardarRegistros();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, id: newRegistro.id }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
    return;
  }

  // GET /api/registros
  if (req.method === 'GET' && req.url === '/api/registros') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      registros: registros,
      total: registros.length
    }));
    return;
  }

  // GET /api/status
  if (req.method === 'GET' && req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      conectado: true,
      registros_locales: registros.length,
      status: 'Servidor local funcionando',
      puerto: PORT
    }));
    return;
  }

  // Default 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

server.listen(PORT, () => {
  console.log('⚠️  Cliente PostgreSQL no disponible - funcionando en modo local únicamente\n');
  console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✓ Datos guardados localmente en: ${registrosPath}`);
  console.log(`✓ Endpoint: POST http://localhost:${PORT}/api/registrar`);
  console.log(`✓ Endpoint: GET http://localhost:${PORT}/api/registros`);
  console.log(`✓ Endpoint: GET http://localhost:${PORT}/api/status`);
  console.log('\n⏭️  Sincronización con Neon omitida - pg no instalado');
  console.log('⏭️  Sincronización con Neon omitida - pg no instalado\n');
});
