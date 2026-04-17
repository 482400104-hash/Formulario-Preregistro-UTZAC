#!/usr/bin/env node

/**
 * Script para configurar automáticamente Vercel con Neon
 * Uso: node setup-vercel.js <vercel-token> <neon-connection-string> <project-id>
 */

const https = require('https');
const args = process.argv.slice(2);

if (args.length < 3) {
  console.error('❌ Uso: node setup-vercel.js <vercel-token> <neon-connection-string> <project-id>');
  console.error('\nEjemplo:');
  console.error('  node setup-vercel.js prj_xxxxx postgresql://... QmFzc3N...');
  process.exit(1);
}

const [vercelToken, neonConnectionString, projectId] = args;

const makeRequest = (method, path, data) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(body)
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

const setup = async () => {
  try {
    console.log('🔧 Configurando Vercel con Neon...\n');

    // Obtener info del proyecto
    console.log('📌 Paso 1: Validando proyecto...');
    const projectResp = await makeRequest('GET', `/v9/projects/${projectId}`);
    
    if (projectResp.status !== 200) {
      console.error(`❌ Error: No se pudo acceder al proyecto. Status: ${projectResp.status}`);
      console.error('Verifique que el project ID sea correcto');
      process.exit(1);
    }

    console.log(`✓ Proyecto encontrado: ${projectResp.data.name}`);

    // Crear variable de entorno
    console.log('\n📌 Paso 2: Agregando variable de entorno NEON_CONNECTION_STRING...');
    const envResp = await makeRequest(
      'POST',
      `/v10/projects/${projectId}/env`,
      {
        key: 'NEON_CONNECTION_STRING',
        value: neonConnectionString,
        target: ['production', 'preview', 'development'],
        type: 'encrypted'
      }
    );

    if (envResp.status === 201) {
      console.log('✓ Variable de entorno agregada correctamente');
    } else {
      console.error(`⚠️  Status: ${envResp.status}`);
      console.error(JSON.stringify(envResp.data, null, 2));
    }

    // Obtener último deploy
    console.log('\n📌 Paso 3: Buscando último deployment...');
    const deploysResp = await makeRequest(
      'GET',
      `/v6/deployments?projectId=${projectId}&limit=1`
    );

    if (deploysResp.data.deployments && deploysResp.data.deployments.length > 0) {
      const lastDeploy = deploysResp.data.deployments[0];
      console.log(`✓ Último deploy encontrado: ${lastDeploy.url}`);

      // Redeploy
      console.log('\n📌 Paso 4: Iniciando redeploy...');
      const redeployResp = await makeRequest(
        'POST',
        `/v13/deployments?forceNew=1`,
        {
          deploymentId: lastDeploy.uid
        }
      );

      if (redeployResp.status >= 200 && redeployResp.status < 300) {
        console.log('✓ Redeploy iniciado');
      } else {
        console.error(`⚠️  Status: ${redeployResp.status}`);
      }
    }

    console.log('\n✅ ¡Configuración completada!');
    console.log('\n📊 Próximos pasos:');
    console.log('1. Ve a: https://vercel.com/dashboard');
    console.log('2. Abre tu proyecto');
    console.log('3. Verifica que NEON_CONNECTION_STRING esté en Settings > Environment Variables');
    console.log('4. El deploy debería estar en progreso');
    console.log('\n⏳ Espera 2-5 minutos para que el deploy termine');
    console.log('✓ Luego tu formulario estará conectado con Neon');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setup();
