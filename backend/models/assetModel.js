const pool = require("../config/db");
const { generateNextId, getAssetPrefix } = require("../utils/idGenerator");
const { createActivityLog } = require("./activityLogModel");

function mapAssignmentColumns(row) {
  return {
    assigned_to_type: row.assigned_to_type || null,
    assigned_employee_id: row.assigned_employee_id || null,
    assigned_team_id: row.assigned_team_id || null,
    assigned_project_id: row.assigned_project_id || null,
    assigned_date: row.assigned_date || null,
    assignment_status: row.assignment_status || null,
  };
}

function assetSelectClause() {
  return `
    a.asset_id,
    a.name,
    a.asset_type,
    a.serial_number,
    a.status,
    a.purchase_date,
    a.description,
    aa.assigned_to_type,
    aa.employee_id AS assigned_employee_id,
    aa.team_id AS assigned_team_id,
    aa.project_id AS assigned_project_id,
    aa.assigned_date,
    aa.status AS assignment_status
  `;
}

function assetFromClause() {
  return `
    assets a
    LEFT JOIN LATERAL (
      SELECT *
      FROM asset_assignments aa
      WHERE aa.asset_id = a.asset_id
        AND aa.status = 'Active'
      ORDER BY aa.assigned_date DESC, aa.assignment_id DESC
      LIMIT 1
    ) aa ON TRUE
  `;
}

async function getAllAssets() {
  const result = await pool.query(
    `SELECT ${assetSelectClause()}
     FROM ${assetFromClause()}
     ORDER BY a.asset_id ASC`
  );

  return result.rows.map((row) => ({
    asset_id: row.asset_id,
    name: row.name,
    asset_type: row.asset_type,
    serial_number: row.serial_number,
    status: row.status,
    purchase_date: row.purchase_date,
    description: row.description,
    ...mapAssignmentColumns(row),
  }));
}

async function getAssetById(assetId) {
  const result = await pool.query(
    `SELECT ${assetSelectClause()}
     FROM ${assetFromClause()}
     WHERE a.asset_id = $1`,
    [assetId]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    asset_id: row.asset_id,
    name: row.name,
    asset_type: row.asset_type,
    serial_number: row.serial_number,
    status: row.status,
    purchase_date: row.purchase_date,
    description: row.description,
    ...mapAssignmentColumns(row),
  };
}

async function closeActiveAssignmentsForAsset(assetId) {
  await pool.query(
    `UPDATE asset_assignments
     SET status = 'Returned',
         return_date = COALESCE(return_date, CURRENT_DATE)
     WHERE asset_id = $1
       AND status = 'Active'`,
    [assetId]
  );
}

async function createAsset(asset) {
  const prefix = getAssetPrefix(asset.asset_type);
  const id = asset.asset_id || generateNextId(prefix, await getAllAssets(), "asset_id");
  const result = await pool.query(
    `INSERT INTO assets (asset_id, name, asset_type, serial_number, status, purchase_date, description)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING asset_id, name, asset_type, serial_number, status, purchase_date, description`,
    [
      id,
      asset.name.trim(),
      asset.asset_type.trim(),
      asset.serial_number.trim(),
      asset.status?.trim() || "Available",
      asset.purchase_date || null,
      asset.description?.trim() || null,
    ]
  );
  const created = result.rows[0];
  await createActivityLog({
    action: "Asset created",
    description: `Asset ${created.asset_id} (${created.name}) was created`,
    type: "asset",
  });
  return created;
}

async function updateAsset(assetId, updates) {
  const current = await getAssetById(assetId);
  if (!current) return null;

  const next = {
    ...current,
    ...updates,
  };

  const result = await pool.query(
    `UPDATE assets
     SET name = $1,
         asset_type = $2,
         serial_number = $3,
         status = $4,
         purchase_date = $5,
         description = $6
     WHERE asset_id = $7
     RETURNING asset_id, name, asset_type, serial_number, status, purchase_date, description`,
    [
      next.name.trim(),
      next.asset_type.trim(),
      next.serial_number.trim(),
      next.status?.trim() || "Available",
      next.purchase_date || null,
      next.description?.trim() || null,
      assetId,
    ]
  );

  if (next.status !== "Assigned") {
    await closeActiveAssignmentsForAsset(assetId);
  }

  const updated = await getAssetById(assetId);
  if (updated) {
    await createActivityLog({
      action: "Asset updated",
      description: `Asset ${updated.asset_id} was updated`,
      type: "asset",
    });
  }

  return updated;
}

async function updateAssetStatus(assetId, status) {
  const result = await pool.query(
    `UPDATE assets
     SET status = $1
     WHERE asset_id = $2
     RETURNING asset_id, name, asset_type, serial_number, status, purchase_date, description`,
    [status, assetId]
  );

  if (status !== "Assigned") {
    await closeActiveAssignmentsForAsset(assetId);
  }

  return result.rows[0] || null;
}

async function deleteAsset(assetId) {
  const asset = await getAssetById(assetId);
  const result = await pool.query(
    `DELETE FROM assets
     WHERE asset_id = $1
     RETURNING asset_id`,
    [assetId]
  );

  if (result.rows[0] && asset) {
    await createActivityLog({
      action: "Asset deleted",
      description: `Asset ${asset.asset_id} (${asset.name}) was deleted`,
      type: "asset",
    });
  }

  return result.rows[0] || null;
}

module.exports = {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
};
