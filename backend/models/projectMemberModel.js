const pool = require("../config/db");
const { generateNextId } = require("../utils/idGenerator");

async function getAllProjectMembers() {
  const result = await pool.query(
    `SELECT project_member_id
     FROM project_members
     ORDER BY project_member_id ASC`
  );
  return result.rows;
}

async function getProjectMembers(projectId) {
  const result = await pool.query(
    `SELECT pm.project_member_id, pm.project_id, pm.employee_id, e.name, e.department, e.designation, e.avatar
     FROM project_members pm
     JOIN employees e ON e.employee_id = pm.employee_id
     WHERE pm.project_id = $1
     ORDER BY pm.project_member_id ASC`,
    [projectId]
  );
  return result.rows;
}

async function addProjectMember(projectId, employeeId) {
  const projectMemberId = generateNextId("PMM", await getAllProjectMembers(), "project_member_id");
  const result = await pool.query(
    `INSERT INTO project_members (project_member_id, project_id, employee_id)
     VALUES ($1, $2, $3)
     RETURNING project_member_id, project_id, employee_id`,
    [projectMemberId, projectId, employeeId]
  );
  return result.rows[0];
}

async function removeProjectMember(projectId, employeeId) {
  const result = await pool.query(
    `DELETE FROM project_members
     WHERE project_id = $1 AND employee_id = $2
     RETURNING project_member_id`,
    [projectId, employeeId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAllProjectMembers,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};
