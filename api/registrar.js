import { Client } from 'pg';
    const { nombre, email, telefono, escuela, carrera, tipo } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        error: 'Nombre y email requeridos'
      });
    }

    const client = new Client({
      connectionString: process.env.NEON_CONNECTION_STRING
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
    `, [nombre, email, telefono || null, escuela || null, carrera || null, tipo || 'no_especificado']);

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