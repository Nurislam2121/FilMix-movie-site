const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'filmix',
    password: 'root',
    port: 5432,
});

pool.query('SELECT NOW()', (err) => {
    if (err) console.error('❌ Ошибка БД:', err.message);
    else console.log('✅ База данных подключена!');
});

module.exports = pool;