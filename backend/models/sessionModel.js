const crypto = require("crypto");
const pool = require("../config/db");

function generateSessionId() {
  return crypto.randomUUID();
}

async function createSession({ userId, refreshTokenHash, expiresAt, rememberMe = false, tokenVersion = 1 }) {
  const sessionId = generateSessionId();
  const result = await pool.query(
    `
      INSERT INTO user_sessions (session_id, user_id, refresh_token_hash, token_version, expires_at, remember_me)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
    [sessionId, userId, refreshTokenHash, tokenVersion, expiresAt, rememberMe]
  );

  return result.rows[0];
}

async function getSessionById(sessionId) {
  const result = await pool.query(
    `
      SELECT session_id, user_id, refresh_token_hash, token_version, expires_at, revoked, remember_me, created_at, updated_at
      FROM user_sessions
      WHERE session_id = $1
      LIMIT 1
    `,
    [sessionId]
  );

  return result.rows[0] || null;
}

async function getSessionByRefreshTokenHash(refreshTokenHash) {
  const result = await pool.query(
    `
      SELECT session_id, user_id, refresh_token_hash, token_version, expires_at, revoked, remember_me, created_at, updated_at
      FROM user_sessions
      WHERE refresh_token_hash = $1
      LIMIT 1
    `,
    [refreshTokenHash]
  );

  return result.rows[0] || null;
}

async function updateSession(sessionId, { refreshTokenHash, expiresAt, tokenVersion }) {
  const result = await pool.query(
    `
      UPDATE user_sessions
      SET refresh_token_hash = $2,
          token_version = $3,
          expires_at = $4,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1
      RETURNING session_id, user_id, refresh_token_hash, token_version, expires_at, revoked, remember_me, created_at, updated_at
    `,
    [sessionId, refreshTokenHash, tokenVersion, expiresAt]
  );

  return result.rows[0] || null;
}

async function revokeSession(sessionId) {
  await pool.query(
    `
      UPDATE user_sessions
      SET revoked = true,
          updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1
    `,
    [sessionId]
  );
}

module.exports = {
  createSession,
  getSessionById,
  getSessionByRefreshTokenHash,
  updateSession,
  revokeSession,
};
