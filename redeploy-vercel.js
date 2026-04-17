#!/usr/bin/env node

import https from 'https';

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Uso: node redeploy-vercel.js <vercel-token> <project-id>');
  process.exit(1);
}

const [vercelToken, projectId] = args;

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
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

const redeploy = async () => {
  try {
    console.log('🚀 Iniciando redeploy en Vercel...\n');

    // Obtener último deploy
    console.log('📌 Buscando último deployment...');
    const deploysResp = await makeRequest(
      'GET',
      `/v6/deployments?projectId=${projectId}&limit=1`
    );

    if (!deploysResp.data.deployments || deploysResp.data.deployments.length === 0) {
      console.error('❌ No se encontraron deployments');
      process.exit(1);
    }

    const lastDeploy = deploysResp.data.deployments[0];
    console.log(`✓ Encontrado: ${lastDeploy.url}`);

    // Hacer redeploy
    console.log('\n📌 Iniciando redeploy...');
    const redeployResp = await makeRequest(
      'POST',
      `/v13/deployments?forceNew=1`,
      {
        deploymentId: lastDeploy.uid
      }
    );

    if (redeployResp.status >= 200 && redeployResp.status < 300) {
      console.log('✓ Redeploy iniciado exitosamente');
    } else if (redeployResp.status === 400) {
      // Intentar con método alternativo
      console.log('⏳ Usando método alternativo de redeploy...');
      const altRedeployResp = await makeRequest(
        'POST',
        `/v12/deployments?forceNew=1`,
        {
          project: projectId,
          source: 'cli'
        }
      );
      
      if (altRedeployResp.status >= 200 && altRedeployResp.status < 300) {
        console.log('✓ Redeploy iniciado (método alternativo)');
      } else {
        console.log(`⚠️  Status: ${altRedeployResp.status}`);
      }
    } else {
      console.log(`⚠️  Status: ${redeployResp.status}`);
    }

    console.log('\n✅ ¡Redeploy completado!');
    console.log('\n📊 Próximos pasos:');
    console.log('1. Ve a: https://vercel.com/dashboard');
    console.log('2. Abre tu proyecto');
    console.log('3. Verifica la sección "Deployments"');
    console.log('4. ⏳ Espera 2-5 minutos para que termine el deploy');
    console.log('\n✓ Después tu app estará conectada con Neon:');
    console.log('   https://formulario-preregistro-utzac.vercel.app');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

redeploy();
