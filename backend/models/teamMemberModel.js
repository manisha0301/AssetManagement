const pool = require("../config/db");
const { generateNextId } = require("../utils/idGenerator");

async function getAllTeamMembers() {
  const result = await pool.query(
    `SELECT team_member_id
     FROM team_members
     ORDER BY team_member_id ASC`
  );
  return result.rows;
}

async function getTeamMembers(teamId) {
  const result = await pool.query(
    `SELECT tm.team_member_id, tm.team_id, tm.employee_id, e.name, e.department, e.designation, e.avatar
     FROM team_members tm
     JOIN employees e ON e.employee_id = tm.employee_id
     WHERE tm.team_id = $1
     ORDER BY tm.team_member_id ASC`,
    [teamId]
  );
  return result.rows;
}

async function addTeamMember(teamId, employeeId) {
  const teamMemberId = generateNextId("TMM", await getAllTeamMembers(), "team_member_id");
  const result = await pool.query(
    `INSERT INTO team_members (team_member_id, team_id, employee_id)
     VALUES ($1, $2, $3)
     RETURNING team_member_id, team_id, employee_id`,
    [teamMemberId, teamId, employeeId]
  );
  return result.rows[0];
}

async function removeTeamMember(teamId, employeeId) {
  const result = await pool.query(
    `DELETE FROM team_members
     WHERE team_id = $1 AND employee_id = $2
     RETURNING team_member_id`,
    [teamId, employeeId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAllTeamMembers,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
};
