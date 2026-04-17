import { Client } from 'pg';
    
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