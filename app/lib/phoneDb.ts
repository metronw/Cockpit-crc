import mysql from 'mysql2/promise';

const phoneConnection = mysql.createPool({
  host: process.env.PHONEDB_HOST,
  port: Number(process.env.PHONEDB_PORT),
  user: process.env.PHONEDB_USER,
  password: process.env.PHONEDB_PASSWORD,
  database: process.env.PHONEDB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export default phoneConnection;