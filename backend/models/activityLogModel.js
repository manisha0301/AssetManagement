const pool = require("../config/db");

async function getAllActivityLogs() {
  const result = await pool.query(
    `SELECT activity_id, action, description, type, created_at
     FROM activity_logs
     ORDER BY created_at DESC, activity_id DESC`
  );

  return result.rows;
}

async function getActivityLogById(activityId) {
  const result = await pool.query(
    `SELECT activity_id, action, description, type, created_at
     FROM activity_logs
     WHERE activity_id = $1`,
    [activityId]
  );

  return result.rows[0] || null;
}

async function createActivityLog(log) {
  const result = await pool.query(
    `INSERT INTO activity_logs (action, description, type, created_at)
     VALUES ($1, $2, $3, COALESCE($4::timestamp, CURRENT_TIMESTAMP))
     RETURNING activity_id, action, description, type, created_at`,
    [log.action.trim(), log.description.trim(), log.type.trim(), log.created_at || null]
  );

  return result.rows[0];
}

module.exports = {
  getAllActivityLogs,
  getActivityLogById,
  createActivityLog,
};
