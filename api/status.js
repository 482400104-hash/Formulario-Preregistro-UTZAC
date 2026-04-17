export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { Client } = await import('pg');
    
    const client = new Client({
      connectionString: process.env.NEON_CONNECTION_STRING
    });

    await client.connect();
    const result = await client.query('SELECT COUNT(*) FROM prospecto');
    const count = parseInt(result.rows[0].count);
    await client.end();

    res.status(200).json({
      conectado: true,
      registros_neon: count,
      neon_status: 'conectado',
      ambiente: process.env.VERCEL_ENV || 'development',
      mensaje: `Sistema en Vercel - Neon: ${count} registros`
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(200).json({
      conectado: false,
      error: error.message,
      neon_status: 'error',
      mensaje: 'Error conectando a Neon'
    });
  }
}