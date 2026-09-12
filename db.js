import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'fatimajk6',
  database: 'flavr_db',
})

export default pool