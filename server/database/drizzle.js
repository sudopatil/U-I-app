const { drizzle } = require('drizzle-orm/mysql2');
const mysql = require('mysql2/promise');
// const { users, couples } = require('./schema');

const { users, couples } = require('./schema/index.js'); // With index.js

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports.db = drizzle(pool, { 
  schema: { users, couples },
  mode: 'default'
});