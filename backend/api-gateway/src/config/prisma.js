const {PrismaClient} = require('@prisma/client');
const {Pool} = require('pg');
const {PrismaPg} = require('@prisma/adapter-pg');

const {config} = require('../config');
const globalForPrisma = global;
const connectionString = config.DATABASE_URL; 
//In development, tools like nodemon or Next.js constantly restart your application or clear module caches when you change code ("hot-reloading"). If you created a new PrismaClient() on every reload, you would quickly max out your database's connection limit and crash the app. By attaching the client to Node's global object (which survives hot-reloads) only in non-production environments, it ensures you reuse the same database connection while you are coding.
let prisma;

if(!globalForPrisma.prisma){
    // 1. Create a connection pool using the standard 'pg' driver
    const pool = new Pool({connectionString});

    // 2. Pass that pool to the adapter
    const adapter = new PrismaPg(pool);

    // 3. Initialize Prisma with the adapter
    globalForPrisma.prisma = new PrismaClient({ adapter,
        log: ['error', 'warn', 'info']
     });
}

// Assign the global instance to our local variable
prisma = globalForPrisma.prisma;

// This ensures hot-reloads in development don't exhaust DB connections
if (config.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

module.exports = prisma;