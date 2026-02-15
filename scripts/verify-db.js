require('dotenv').config();
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function test() {
    console.log('Testing Database Connection...');
    const url = process.env.DATABASE_URL;

    if (!url) {
        console.error('❌ DATABASE_URL is undefined!');
        process.exit(1);
    } else {
        console.log('✅ DATABASE_URL is defined (starts with: ' + url.substring(0, 15) + '...)');
    }

    try {
        console.log('Connecting with pg Pool...');
        const pool = new Pool({ connectionString: url });
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        console.log('✅ PG Connection successful:', res.rows[0]);
        client.release();
        await pool.end();
    } catch (e) {
        console.error('❌ PG Connection failed:', e);
        process.exit(1);
    }

    try {
        console.log('Connecting with Prisma Adapter...');
        const pool = new Pool({ connectionString: url });
        const adapter = new PrismaNeon(pool);
        const prisma = new PrismaClient({ adapter });

        await prisma.$connect();
        console.log('✅ Prisma Connection successful');

        const count = await prisma.project.count();
        console.log(`✅ Found ${count} projects`);

        await prisma.$disconnect();
    } catch (e) {
        console.error('❌ Prisma Connection failed:', e);
        process.exit(1);
    }
}

test();
