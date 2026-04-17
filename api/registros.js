import { Client } from 'pg';
    
    const client = new Client({
      connectionString: process.env.NEON_CONNECTION_STRING
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