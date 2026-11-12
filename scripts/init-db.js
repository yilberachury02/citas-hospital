const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Cargar .env.local si existe
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function initDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.includes('fake') || databaseUrl.includes('<<')) {
    console.error('Error: DATABASE_URL no está configurada o contiene un valor placeholder.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✓ Conectado exitosamente a la base de datos PostgreSQL/Supabase.');

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Ejecutando schema.sql...');
    await client.query(sql);

    console.log('✓ Schema ejecutado exitosamente.');

    // Verificar las tablas creadas
    const [esp, con, pac, med, cit] = await Promise.all([
      client.query('SELECT COUNT(*)::int AS c FROM especialidades'),
      client.query('SELECT COUNT(*)::int AS c FROM consultorios'),
      client.query('SELECT COUNT(*)::int AS c FROM pacientes'),
      client.query('SELECT COUNT(*)::int AS c FROM medicos'),
      client.query('SELECT COUNT(*)::int AS c FROM citas'),
    ]);

    console.log('Estado de las tablas:');
    console.log(` - especialidades: ${esp.rows[0].c} registros`);
    console.log(` - consultorios: ${con.rows[0].c} registros`);
    console.log(` - pacientes: ${pac.rows[0].c} registros`);
    console.log(` - medicos: ${med.rows[0].c} registros`);
    console.log(` - citas: ${cit.rows[0].c} registros`);
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDb();
