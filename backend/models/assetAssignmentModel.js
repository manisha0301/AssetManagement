const pool = require("../config/db");
const { generateNextId } = require("../utils/idGenerator");
const { createHttpError } = require("../utils/httpError");
const { getAssetById, updateAssetStatus } = require("./assetModel");
const { getEmployeeById } = require("./employeeModel");
const { getTeamById } = require("./teamModel");
const { getProjectById } = require("./projectModel");
const { createActivityLog } = require("./activityLogModel");

async function getAllAssetAssignments() {
  const result = await pool.query(
    `SELECT aa.assignment_id,
            aa.asset_id,
            aa.assigned_to_type,
            aa.employee_id,
            aa.team_id,
            aa.project_id,
            aa.assigned_date,
            aa.return_date,
            aa.status,
            e.name AS employee_name,
            t.name AS team_name,
            p.name AS project_name
     FROM asset_assignments aa
     LEFT JOIN employees e ON e.employee_id = aa.employee_id
     LEFT JOIN teams t ON t.team_id = aa.team_id
     LEFT JOIN projects p ON p.project_id = aa.project_id
     ORDER BY aa.assigned_date DESC, aa.assignment_id DESC`
  );
  return result.rows;
}

async function getAssetAssignmentsByAssetId(assetId) {
  const result = await pool.query(
    `SELECT aa.assignment_id,
            aa.asset_id,
            aa.assigned_to_type,
            aa.employee_id,
            aa.team_id,
            aa.project_id,
            aa.assigned_date,
            aa.return_date,
            aa.status,
            e.name AS employee_name,
            t.name AS team_name,
            p.name AS project_name
     FROM asset_assignments aa
     LEFT JOIN employees e ON e.employee_id = aa.employee_id
     LEFT JOIN teams t ON t.team_id = aa.team_id
     LEFT JOIN projects p ON p.project_id = aa.project_id
     WHERE aa.asset_id = $1
     ORDER BY aa.assigned_date DESC, aa.assignment_id DESC`,
    [assetId]
  );
  return result.rows;
}

async function getAssignmentById(assignmentId) {
  const result = await pool.query(
    `SELECT aa.assignment_id,
            aa.asset_id,
            aa.assigned_to_type,
            aa.employee_id,
            aa.team_id,
            aa.project_id,
            aa.assigned_date,
            aa.return_date,
            aa.status,
            e.name AS employee_name,
            t.name AS team_name,
            p.name AS project_name
     FROM asset_assignments aa
     LEFT JOIN employees e ON e.employee_id = aa.employee_id
     LEFT JOIN teams t ON t.team_id = aa.team_id
     LEFT JOIN projects p ON p.project_id = aa.project_id
     WHERE aa.assignment_id = $1`,
    [assignmentId]
  );
  return result.rows[0] || null;
}

async function getActiveAssignmentByAssetId(assetId) {
  const result = await pool.query(
    `SELECT aa.assignment_id,
            aa.asset_id,
            aa.assigned_to_type,
            aa.employee_id,
            aa.team_id,
            aa.project_id,
            aa.assigned_date,
            aa.return_date,
            aa.status
     FROM asset_assignments aa
     WHERE aa.asset_id = $1 AND aa.status = 'Active'
     ORDER BY aa.assigned_date DESC, aa.assignment_id DESC
     LIMIT 1`,
    [assetId]
  );
  return result.rows[0] || null;
}

function buildTargetPayload(assignment) {
  const assignedToType = assignment.assigned_to_type;
  if (assignedToType === "employee") {
    return {
      assigned_to_type: "employee",
      employee_id: assignment.employee_id,
      team_id: null,
      project_id: null,
    };
  }

  if (assignedToType === "team") {
    return {
      assigned_to_type: "team",
      employee_id: null,
      team_id: assignment.team_id,
      project_id: null,
    };
  }

  if (assignedToType === "project") {
    return {
      assigned_to_type: "project",
      employee_id: null,
      team_id: null,
      project_id: assignment.project_id,
    };
  }

  throw createHttpError("Invalid assignment target", 400, "INVALID_ASSIGNMENT_TARGET");
}

async function createAssetAssignment(assignment) {
  const asset = await getAssetById(assignment.asset_id);
  if (!asset) throw createHttpError("Asset not found", 404, "ASSET_NOT_FOUND");

  const existingActive = await getActiveAssignmentByAssetId(assignment.asset_id);
  if (existingActive) {
    throw createHttpError("Asset already has an active assignment", 409, "ASSET_ALREADY_ASSIGNED");
  }

  let targetName = null;
  if (assignment.assigned_to_type === "employee") {
    const employee = await getEmployeeById(assignment.employee_id);
    if (!employee) throw createHttpError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");
    targetName = employee.name;
  } else if (assignment.assigned_to_type === "team") {
    const team = await getTeamById(assignment.team_id);
    if (!team) throw createHttpError("Team not found", 404, "TEAM_NOT_FOUND");
    targetName = team.name;
  } else if (assignment.assigned_to_type === "project") {
    const project = await getProjectById(assignment.project_id);
    if (!project) throw createHttpError("Project not found", 404, "PROJECT_NOT_FOUND");
    targetName = project.name;
  } else {
    throw createHttpError("Invalid assignment target type", 400, "INVALID_ASSIGNMENT_TARGET");
  }

  const prefix = "ASN";
  const id = assignment.assignment_id || generateNextId(prefix, await getAllAssetAssignments(), "assignment_id");
  const targetPayload = buildTargetPayload(assignment);

  const result = await pool.query(
    `INSERT INTO asset_assignments (
       assignment_id, asset_id, assigned_to_type, employee_id, team_id, project_id, assigned_date, return_date, status
     ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7::date, CURRENT_DATE), NULL, COALESCE($8, 'Active'))
     RETURNING assignment_id, asset_id, assigned_to_type, employee_id, team_id, project_id, assigned_date, return_date, status`,
    [
      id,
      assignment.asset_id,
      targetPayload.assigned_to_type,
      targetPayload.employee_id,
      targetPayload.team_id,
      targetPayload.project_id,
      assignment.assigned_date || null,
      assignment.status || "Active",
    ]
  );

  await updateAssetStatus(assignment.asset_id, "Assigned");
  await createActivityLog({
    action: "Asset assigned",
    description: `Asset ${assignment.asset_id} was assigned to ${targetName} (${assignment.assigned_to_type})`,
    type: "assignment",
  });
  return result.rows[0];
}

async function closeAssetAssignment(assignmentId) {
  const current = await getAssignmentById(assignmentId);
  if (!current) return null;

  const result = await pool.query(
    `UPDATE asset_assignments
     SET status = 'Returned',
         return_date = COALESCE(return_date, CURRENT_DATE)
     WHERE assignment_id = $1
     RETURNING assignment_id, asset_id, assigned_to_type, employee_id, team_id, project_id, assigned_date, return_date, status`,
    [assignmentId]
  );

  if (result.rows[0]) {
    await updateAssetStatus(result.rows[0].asset_id, "Available");
    const assignment = result.rows[0];
    const target = assignment.assigned_to_type === "employee"
      ? assignment.employee_name
      : assignment.assigned_to_type === "team"
        ? assignment.team_name
        : assignment.project_name;

    await createActivityLog({
      action: "Asset returned",
      description: `Assignment ${assignment.assignment_id} for asset ${assignment.asset_id} was returned from ${target || assignment.assigned_to_type}`,
      type: "assignment",
    });
  }

  return result.rows[0] || null;
}

module.exports = {
  getAllAssetAssignments,
  getAssetAssignmentsByAssetId,
  getAssignmentById,
  getActiveAssignmentByAssetId,
  createAssetAssignment,
  closeAssetAssignment,
};
