export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { Client } = await import('pg');
    
    const client = new Client({
      connectionString: process.env.NEON_CONNECTION_STRING,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    const result = await client.query(`
      SELECT id, nombre, email, telefono, escuela, carrera, tipo, fecha_registro
      FROM prospecto
      ORDER BY fecha_registro DESC
    `);

    await client.end();

    res.status(200).json({
      success: true,
      registros: result.rows || [],
      total: result.rows ? result.rows.length : 0
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({
      error: 'Error al obtener registros',
      detalles: error.message
    });
  }
}