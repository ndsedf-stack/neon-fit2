const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        sid VARCHAR PRIMARY KEY,
        sess JSONB NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_session_expire ON sessions(expire);

      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS workout_data (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR REFERENCES users(id) ON DELETE CASCADE,
        data_key VARCHAR NOT NULL,
        data_value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, data_key)
      );
    `);
    console.log('Database tables initialized');
  } finally {
    client.release();
  }
}

async function getUser(userId) {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

async function upsertUser(userData) {
  const { id, email, firstName, lastName, profileImageUrl } = userData;
  const result = await pool.query(`
    INSERT INTO users (id, email, first_name, last_name, profile_image_url)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      profile_image_url = EXCLUDED.profile_image_url,
      updated_at = NOW()
    RETURNING *
  `, [id, email, firstName, lastName, profileImageUrl]);
  return result.rows[0];
}

async function getUserData(userId, dataKey) {
  const result = await pool.query(
    'SELECT data_value FROM workout_data WHERE user_id = $1 AND data_key = $2',
    [userId, dataKey]
  );
  return result.rows[0]?.data_value;
}

async function setUserData(userId, dataKey, dataValue) {
  const result = await pool.query(`
    INSERT INTO workout_data (user_id, data_key, data_value)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, data_key) DO UPDATE SET
      data_value = EXCLUDED.data_value,
      updated_at = NOW()
    RETURNING *
  `, [userId, dataKey, JSON.stringify(dataValue)]);
  return result.rows[0];
}

async function getAllUserData(userId) {
  const result = await pool.query(
    'SELECT data_key, data_value FROM workout_data WHERE user_id = $1',
    [userId]
  );
  const data = {};
  result.rows.forEach(row => {
    data[row.data_key] = row.data_value;
  });
  return data;
}

module.exports = {
  pool,
  initDatabase,
  getUser,
  upsertUser,
  getUserData,
  setUserData,
  getAllUserData
};
