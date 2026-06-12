const pool = require("../config/db");
const { generateNextId } = require("../utils/idGenerator");
const { createHttpError } = require("../utils/httpError");
const { getAssetById, updateAssetStatus } = require("./assetModel");
const { getEmployeeById } = require("./employeeModel");
const { getActiveAssignmentByAssetId } = require("./assetAssignmentModel");
const { createActivityLog } = require("./activityLogModel");

async function getAllTemporaryIssues() {
  const result = await pool.query(
    `SELECT ti.issue_id,
            ti.asset_id,
            ti.employee_id,
            ti.issued_by,
            ti.received_by,
            ti.purpose,
            ti.event_name,
            ti.issue_date,
            ti.return_date,
            ti.status,
            asset.name AS asset_name,
            asset.asset_type AS asset_type,
            employee.name AS employee_name,
            issuer.name AS issued_by_name,
            receiver.name AS received_by_name
     FROM temporary_issues ti
     LEFT JOIN assets asset ON asset.asset_id = ti.asset_id
     LEFT JOIN employees employee ON employee.employee_id = ti.employee_id
     LEFT JOIN employees issuer ON issuer.employee_id = ti.issued_by
     LEFT JOIN employees receiver ON receiver.employee_id = ti.received_by
     ORDER BY ti.issue_date DESC, ti.issue_id DESC`
  );

  return result.rows;
}

async function getTemporaryIssueById(issueId) {
  const result = await pool.query(
    `SELECT ti.issue_id,
            ti.asset_id,
            ti.employee_id,
            ti.issued_by,
            ti.received_by,
            ti.purpose,
            ti.event_name,
            ti.issue_date,
            ti.return_date,
            ti.status,
            asset.name AS asset_name,
            asset.asset_type AS asset_type,
            employee.name AS employee_name,
            issuer.name AS issued_by_name,
            receiver.name AS received_by_name
     FROM temporary_issues ti
     LEFT JOIN assets asset ON asset.asset_id = ti.asset_id
     LEFT JOIN employees employee ON employee.employee_id = ti.employee_id
     LEFT JOIN employees issuer ON issuer.employee_id = ti.issued_by
     LEFT JOIN employees receiver ON receiver.employee_id = ti.received_by
     WHERE ti.issue_id = $1`,
    [issueId]
  );

  return result.rows[0] || null;
}

async function getTemporaryIssuesByAssetId(assetId) {
  const result = await pool.query(
    `SELECT ti.issue_id,
            ti.asset_id,
            ti.employee_id,
            ti.issued_by,
            ti.received_by,
            ti.purpose,
            ti.event_name,
            ti.issue_date,
            ti.return_date,
            ti.status,
            asset.name AS asset_name,
            asset.asset_type AS asset_type,
            employee.name AS employee_name,
            issuer.name AS issued_by_name,
            receiver.name AS received_by_name
     FROM temporary_issues ti
     LEFT JOIN assets asset ON asset.asset_id = ti.asset_id
     LEFT JOIN employees employee ON employee.employee_id = ti.employee_id
     LEFT JOIN employees issuer ON issuer.employee_id = ti.issued_by
     LEFT JOIN employees receiver ON receiver.employee_id = ti.received_by
     WHERE ti.asset_id = $1
     ORDER BY ti.issue_date DESC, ti.issue_id DESC`,
    [assetId]
  );

  return result.rows;
}

async function getTemporaryIssuesByEmployeeId(employeeId) {
  const result = await pool.query(
    `SELECT ti.issue_id,
            ti.asset_id,
            ti.employee_id,
            ti.issued_by,
            ti.received_by,
            ti.purpose,
            ti.event_name,
            ti.issue_date,
            ti.return_date,
            ti.status,
            asset.name AS asset_name,
            asset.asset_type AS asset_type,
            employee.name AS employee_name,
            issuer.name AS issued_by_name,
            receiver.name AS received_by_name
     FROM temporary_issues ti
     LEFT JOIN assets asset ON asset.asset_id = ti.asset_id
     LEFT JOIN employees employee ON employee.employee_id = ti.employee_id
     LEFT JOIN employees issuer ON issuer.employee_id = ti.issued_by
     LEFT JOIN employees receiver ON receiver.employee_id = ti.received_by
     WHERE ti.employee_id = $1
     ORDER BY ti.issue_date DESC, ti.issue_id DESC`,
    [employeeId]
  );

  return result.rows;
}

async function createTemporaryIssue(issue) {
  const asset = await getAssetById(issue.asset_id);
  if (!asset) throw createHttpError("Asset not found", 404, "ASSET_NOT_FOUND");

  const employee = await getEmployeeById(issue.employee_id);
  if (!employee) throw createHttpError("Employee not found", 404, "EMPLOYEE_NOT_FOUND");

  const issuedBy = await getEmployeeById(issue.issued_by);
  if (!issuedBy) throw createHttpError("Issued-by employee not found", 404, "ISSUER_NOT_FOUND");

  if (issue.received_by) {
    const receivedBy = await getEmployeeById(issue.received_by);
    if (!receivedBy) throw createHttpError("Received-by employee not found", 404, "RECEIVER_NOT_FOUND");
  }

  if (asset.status !== "Available") {
    throw createHttpError("Asset must be available for temporary issue", 409, "ASSET_NOT_AVAILABLE");
  }

  const activeAssignment = await getActiveAssignmentByAssetId(issue.asset_id);
  if (activeAssignment) {
    throw createHttpError("Asset already has an active assignment", 409, "ASSET_ALREADY_ASSIGNED");
  }

  const activeIssue = await pool.query(
    `SELECT issue_id
     FROM temporary_issues
     WHERE asset_id = $1 AND status = 'Active'
     LIMIT 1`,
    [issue.asset_id]
  );
  if (activeIssue.rows[0]) {
    throw createHttpError("Asset already has an active temporary issue", 409, "ASSET_ALREADY_ISSUED");
  }

  const id = issue.issue_id || generateNextId("TIP", await getAllTemporaryIssues(), "issue_id");
  const result = await pool.query(
    `INSERT INTO temporary_issues (
       issue_id, asset_id, employee_id, issued_by, received_by, purpose, event_name, issue_date, return_date, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8::date, CURRENT_DATE), $9::date, COALESCE($10, 'Active'))
     RETURNING issue_id, asset_id, employee_id, issued_by, received_by, purpose, event_name, issue_date, return_date, status`,
    [
      id,
      issue.asset_id,
      issue.employee_id,
      issue.issued_by,
      issue.received_by || null,
      issue.purpose.trim(),
      issue.event_name.trim(),
      issue.issue_date || null,
      issue.return_date || null,
      issue.status || "Active",
    ]
  );

  await updateAssetStatus(issue.asset_id, "Temporary");
  await createActivityLog({
    action: "Temporary issue created",
    description: `Asset ${asset.asset_id} was temporarily issued to ${employee.name}`,
    type: "temporary_issue",
  });

  return result.rows[0];
}

async function updateTemporaryIssue(issueId, updates) {
  const current = await getTemporaryIssueById(issueId);
  if (!current) return null;

  const next = {
    ...current,
    ...updates,
  };

  const result = await pool.query(
    `UPDATE temporary_issues
     SET employee_id = $1,
         issued_by = $2,
         received_by = $3,
         purpose = $4,
         event_name = $5,
         issue_date = $6,
         return_date = $7,
         status = $8
     WHERE issue_id = $9
     RETURNING issue_id, asset_id, employee_id, issued_by, received_by, purpose, event_name, issue_date, return_date, status`,
    [
      next.employee_id,
      next.issued_by,
      next.received_by || null,
      next.purpose,
      next.event_name,
      next.issue_date || null,
      next.return_date || null,
      next.status || "Active",
      issueId,
    ]
  );

  const updated = result.rows[0] || null;
  if (updated) {
    if (current.status !== updated.status) {
      if (updated.status === "Returned") {
        await updateAssetStatus(updated.asset_id, "Available");
        await createActivityLog({
          action: "Temporary issue returned",
          description: `Asset ${updated.asset_id} was marked returned in temporary issue ${updated.issue_id}`,
          type: "temporary_issue",
        });
      } else if (updated.status === "Active") {
        await createActivityLog({
          action: "Temporary issue reopened",
          description: `Temporary issue ${updated.issue_id} for asset ${updated.asset_id} was reopened`,
          type: "temporary_issue",
        });
      }
    } else {
      await createActivityLog({
        action: "Temporary issue updated",
        description: `Temporary issue ${updated.issue_id} for asset ${updated.asset_id} was updated`,
        type: "temporary_issue",
      });
    }
  }

  return updated;
}

async function closeTemporaryIssue(issueId) {
  const current = await getTemporaryIssueById(issueId);
  if (!current) return null;

  const result = await pool.query(
    `UPDATE temporary_issues
     SET status = 'Returned',
         return_date = COALESCE(return_date, CURRENT_DATE)
     WHERE issue_id = $1
     RETURNING issue_id, asset_id, employee_id, issued_by, received_by, purpose, event_name, issue_date, return_date, status`,
    [issueId]
  );

  if (result.rows[0]) {
    await updateAssetStatus(result.rows[0].asset_id, "Available");
    const employee = await getEmployeeById(result.rows[0].employee_id);
    await createActivityLog({
      action: "Temporary issue returned",
      description: `Asset ${result.rows[0].asset_id} was returned from ${employee?.name || result.rows[0].employee_id}`,
      type: "temporary_issue",
    });
  }

  return result.rows[0] || null;
}

async function deleteTemporaryIssue(issueId) {
  const current = await getTemporaryIssueById(issueId);
  if (!current) return null;

  if (current.status === "Active") {
    await updateAssetStatus(current.asset_id, "Available");
    await createActivityLog({
      action: "Temporary issue deleted",
      description: `Active temporary issue for asset ${current.asset_id} was deleted`,
      type: "temporary_issue",
    });
  }

  const result = await pool.query(
    `DELETE FROM temporary_issues
     WHERE issue_id = $1
     RETURNING issue_id`,
    [issueId]
  );

  return result.rows[0] || null;
}

module.exports = {
  getAllTemporaryIssues,
  getTemporaryIssueById,
  getTemporaryIssuesByAssetId,
  getTemporaryIssuesByEmployeeId,
  createTemporaryIssue,
  updateTemporaryIssue,
  closeTemporaryIssue,
  deleteTemporaryIssue,
};
