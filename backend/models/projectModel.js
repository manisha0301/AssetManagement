const pool = require("../config/db");

async function getAllProjects() {
  const result = await pool.query(
    `SELECT project_id, project_code, name, manager_id, status
     FROM projects
     ORDER BY project_id ASC`
  );
  return result.rows;
}

async function getProjectById(projectId) {
  const result = await pool.query(
    `SELECT project_id, project_code, name, manager_id, status
     FROM projects
     WHERE project_id = $1`,
    [projectId]
  );
  return result.rows[0] || null;
}

async function createProject(project) {
  const result = await pool.query(
    `INSERT INTO projects (project_id, project_code, name, manager_id, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING project_id, project_code, name, manager_id, status`,
    [
      project.project_id,
      project.project_code.trim(),
      project.name.trim(),
      project.manager_id || null,
      project.status?.trim() || "Planning",
    ]
  );
  return result.rows[0];
}

async function updateProject(projectId, updates) {
  const current = await getProjectById(projectId);
  if (!current) return null;

  const next = { ...current, ...updates };
  const result = await pool.query(
    `UPDATE projects
     SET project_code = $1,
         name = $2,
         manager_id = $3,
         status = $4
     WHERE project_id = $5
     RETURNING project_id, project_code, name, manager_id, status`,
    [next.project_code.trim(), next.name.trim(), next.manager_id || null, next.status?.trim() || "Planning", projectId]
  );
  return result.rows[0] || null;
}

async function deleteProject(projectId) {
  const result = await pool.query(
    `DELETE FROM projects
     WHERE project_id = $1
     RETURNING project_id`,
    [projectId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
