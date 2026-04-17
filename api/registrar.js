export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { Client } = await import('pg');
    const { name, email, telefono, escuela, carrera, tipo } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Nombre y email requeridos'
      });
    }

    const client = new Client({
      connectionString: process.env.NEON_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Crear tabla si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS prospecto (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        telefono VARCHAR(20),
        escuela VARCHAR(255),
        carrera VARCHAR(255),
        tipo VARCHAR(50),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_email ON prospecto(email);
    `);

    // Insertar registro
    const result = await client.query(`
      INSERT INTO prospecto (nombre, email, telefono, escuela, carrera, tipo)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `, [name, email, telefono || null, escuela || null, carrera || null, tipo || 'no_especificado']);

    await client.end();

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: 'Email ya registrado'
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Registro exitoso en Neon',
      id: result.rows[0].id
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Error al registrar',
      detalles: error.message
    });
  }
}