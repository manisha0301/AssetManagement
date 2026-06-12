const pool = require("../config/db");
const { createHttpError } = require("../utils/httpError");

async function getAllTeams() {
  const result = await pool.query(
    `SELECT team_id, name, manager_id, description
     FROM teams
     ORDER BY team_id ASC`
  );
  return result.rows;
}

async function getTeamById(teamId) {
  const result = await pool.query(
    `SELECT team_id, name, manager_id, description
     FROM teams
     WHERE team_id = $1`,
    [teamId]
  );
  return result.rows[0] || null;
}

async function createTeam(team) {
  const result = await pool.query(
    `INSERT INTO teams (team_id, name, manager_id, description)
     VALUES ($1, $2, $3, $4)
     RETURNING team_id, name, manager_id, description`,
    [team.team_id, team.name.trim(), team.manager_id || null, team.description || null]
  );
  return result.rows[0];
}

async function updateTeam(teamId, updates) {
  const current = await getTeamById(teamId);
  if (!current) return null;

  const next = { ...current, ...updates };
  const result = await pool.query(
    `UPDATE teams
     SET name = $1,
         manager_id = $2,
         description = $3
     WHERE team_id = $4
     RETURNING team_id, name, manager_id, description`,
    [next.name.trim(), next.manager_id || null, next.description || null, teamId]
  );
  return result.rows[0] || null;
}

async function deleteTeam(teamId) {
  const result = await pool.query(
    `DELETE FROM teams
     WHERE team_id = $1
     RETURNING team_id`,
    [teamId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};
