// Script para crear la tabla en Neon
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://neondb_owner:npg_Oh0NikDgM3Wu@ep-purple-voice-anvvdkos-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setupDatabase() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('Conectando a Neon...');
    await client.connect();
    console.log('✓ Conexión exitosa');

    console.log('Creando tabla prospecto...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS prospecto (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        telefono VARCHAR(20),
        escuela VARCHAR(255),
        carrera VARCHAR(255),
        tipo VARCHAR(50),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Tabla prospecto creada exitosamente');

    // Verificar
    const result = await client.query('SELECT * FROM prospecto;');
    console.log('✓ Tabla verificada. Registros actuales:', result.rowCount);

    await client.end();
    console.log('\n✅ Base de datos lista para usar en Vercel');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupDatabase();
