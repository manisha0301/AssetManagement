function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeIdentifier(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value).trim();
  }

  return "";
}

function normalizeOptionalString(value) {
  const normalized = normalizeString(value);
  return normalized || null;
}

function buildEmployeeSyncName(body) {
  const directName = normalizeString(body.name);
  if (directName) return directName;

  const firstName = normalizeString(body.first_name) || normalizeString(body.firstName);
  const lastName = normalizeString(body.last_name) || normalizeString(body.lastName);

  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function normalizeEmployeeSyncPayload(body = {}) {
  return {
    employee_id: normalizeIdentifier(body.employee_id),
    name: buildEmployeeSyncName(body),
    department: normalizeString(body.department),
    designation: normalizeString(body.designation),
    avatar: normalizeOptionalString(body.avatar),
  };
}

function validateEmployeeCreate(req, res, next) {
  const { employee_id, name, department, designation, avatar } = req.body;
  const errors = [];

  if (employee_id !== undefined && !isNonEmptyString(employee_id)) {
    errors.push("employee_id must be a non-empty string");
  }
  if (!isNonEmptyString(name)) errors.push("name is required");
  if (!isNonEmptyString(department)) errors.push("department is required");
  if (!isNonEmptyString(designation)) errors.push("designation is required");
  if (avatar !== undefined && !isNonEmptyString(avatar)) {
    errors.push("avatar must be a non-empty string when provided");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  return next();
}

function validateEmployeeSyncPayload(req, res, next) {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const normalizedPayload = normalizeEmployeeSyncPayload(body);
  const errors = [];

  if (
    body.employee_id !== undefined &&
    body.employee_id !== null &&
    typeof body.employee_id !== "string" &&
    typeof body.employee_id !== "number"
  ) {
    errors.push({ field: "employee_id", message: "employee_id must be a string or number when provided" });
  }
  if (body.name !== undefined && body.name !== null && typeof body.name !== "string") {
    errors.push({ field: "name", message: "name must be a string when provided" });
  }
  if (body.first_name !== undefined && body.first_name !== null && typeof body.first_name !== "string") {
    errors.push({ field: "first_name", message: "first_name must be a string when provided" });
  }
  if (body.firstName !== undefined && body.firstName !== null && typeof body.firstName !== "string") {
    errors.push({ field: "firstName", message: "firstName must be a string when provided" });
  }
  if (body.last_name !== undefined && body.last_name !== null && typeof body.last_name !== "string") {
    errors.push({ field: "last_name", message: "last_name must be a string when provided" });
  }
  if (body.lastName !== undefined && body.lastName !== null && typeof body.lastName !== "string") {
    errors.push({ field: "lastName", message: "lastName must be a string when provided" });
  }
  if (body.department !== undefined && body.department !== null && typeof body.department !== "string") {
    errors.push({ field: "department", message: "department must be a string when provided" });
  }
  if (body.designation !== undefined && body.designation !== null && typeof body.designation !== "string") {
    errors.push({ field: "designation", message: "designation must be a string when provided" });
  }
  if (body.avatar !== undefined && body.avatar !== null && typeof body.avatar !== "string") {
    errors.push({ field: "avatar", message: "avatar must be a string when provided" });
  }

  if (!normalizedPayload.employee_id) errors.push({ field: "employee_id", message: "employee_id is required" });
  if (!normalizedPayload.name) errors.push({ field: "name", message: "name is required" });
  if (!normalizedPayload.department) errors.push({ field: "department", message: "department is required" });
  if (!normalizedPayload.designation) errors.push({ field: "designation", message: "designation is required" });

  if (errors.length > 0) {
    console.warn("[employee-sync] Validation failed", {
      employee_id: normalizedPayload.employee_id || null,
      errors,
    });

    return res.status(400).json({
      success: false,
      code: "EMPLOYEE_SYNC_VALIDATION_ERROR",
      message: "Employee sync payload validation failed",
      errors,
    });
  }

  req.employeeSyncPayload = normalizedPayload;
  return next();
}

function validateEmployeeUpdate(req, res, next) {
  const { name, department, designation, avatar } = req.body;
  const allowedFields = ["name", "department", "designation", "avatar"];
  const bodyKeys = Object.keys(req.body);
  const hasAllowedField = bodyKeys.some((key) => allowedFields.includes(key));

  if (!hasAllowedField) {
    return res.status(400).json({
      success: false,
      message: "At least one valid field is required for update",
    });
  }

  const errors = [];
  if (name !== undefined && !isNonEmptyString(name)) errors.push("name must be a non-empty string");
  if (department !== undefined && !isNonEmptyString(department)) errors.push("department must be a non-empty string");
  if (designation !== undefined && !isNonEmptyString(designation)) errors.push("designation must be a non-empty string");
  if (avatar !== undefined && !isNonEmptyString(avatar)) errors.push("avatar must be a non-empty string");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  return next();
}

function validateAssetCreate(req, res, next) {
  const { asset_id, name, asset_type, serial_number, status, purchase_date, description } = req.body;
  const errors = [];

  if (asset_id !== undefined && !isNonEmptyString(asset_id)) {
    errors.push("asset_id must be a non-empty string");
  }
  if (!isNonEmptyString(name)) errors.push("name is required");
  if (!isNonEmptyString(asset_type)) errors.push("asset_type is required");
  if (!isNonEmptyString(serial_number)) errors.push("serial_number is required");
  if (status !== undefined && !isNonEmptyString(status)) errors.push("status must be a non-empty string when provided");
  if (purchase_date !== undefined && typeof purchase_date !== "string") {
    errors.push("purchase_date must be a string in YYYY-MM-DD format when provided");
  }
  if (description !== undefined && typeof description !== "string") {
    errors.push("description must be a string when provided");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  return next();
}

function validateAssetUpdate(req, res, next) {
  const { name, asset_type, serial_number, status, purchase_date, description } = req.body;
  const allowedFields = ["name", "asset_type", "serial_number", "status", "purchase_date", "description"];
  const bodyKeys = Object.keys(req.body);
  const hasAllowedField = bodyKeys.some((key) => allowedFields.includes(key));

  if (!hasAllowedField) {
    return res.status(400).json({
      success: false,
      message: "At least one valid field is required for update",
    });
  }

  const errors = [];
  if (name !== undefined && !isNonEmptyString(name)) errors.push("name must be a non-empty string");
  if (asset_type !== undefined && !isNonEmptyString(asset_type)) errors.push("asset_type must be a non-empty string");
  if (serial_number !== undefined && !isNonEmptyString(serial_number)) errors.push("serial_number must be a non-empty string");
  if (status !== undefined && !isNonEmptyString(status)) errors.push("status must be a non-empty string");
  if (purchase_date !== undefined && typeof purchase_date !== "string") {
    errors.push("purchase_date must be a string in YYYY-MM-DD format when provided");
  }
  if (description !== undefined && typeof description !== "string") {
    errors.push("description must be a string when provided");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  return next();
}

function validateTeamCreate(req, res, next) {
  const { team_id, name, manager_id, description } = req.body;
  const errors = [];

  if (team_id !== undefined && !isNonEmptyString(team_id)) {
    errors.push("team_id must be a non-empty string");
  }
  if (!isNonEmptyString(name)) errors.push("name is required");
  if (manager_id !== undefined && !isNonEmptyString(manager_id)) {
    errors.push("manager_id must be a non-empty string when provided");
  }
  if (description !== undefined && typeof description !== "string") {
    errors.push("description must be a string when provided");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  return next();
}

function validateTeamUpdate(req, res, next) {
  const { name, manager_id, description } = req.body;
  const allowedFields = ["name", "manager_id", "description"];
  const bodyKeys = Object.keys(req.body);
  const hasAllowedField = bodyKeys.some((key) => allowedFields.includes(key));

  if (!hasAllowedField) {
    return res.status(400).json({
      success: false,
      message: "At least one valid field is required for update",
    });
  }

  const errors = [];
  if (name !== undefined && !isNonEmptyString(name)) errors.push("name must be a non-empty string");
  if (manager_id !== undefined && !isNonEmptyString(manager_id)) errors.push("manager_id must be a non-empty string");
  if (description !== undefined && typeof description !== "string") errors.push("description must be a string");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  return next();
}

function validateProjectCreate(req, res, next) {
  const { project_id, project_code, name, manager_id, status } = req.body;
  const errors = [];

  if (project_id !== undefined && !isNonEmptyString(project_id)) {
    errors.push("project_id must be a non-empty string");
  }
  if (!isNonEmptyString(project_code)) errors.push("project_code is required");
  if (!isNonEmptyString(name)) errors.push("name is required");
  if (manager_id !== undefined && !isNonEmptyString(manager_id)) {
    errors.push("manager_id must be a non-empty string when provided");
  }
  if (status !== undefined && !isNonEmptyString(status)) {
    errors.push("status must be a non-empty string when provided");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  return next();
}

function validateProjectUpdate(req, res, next) {
  const { project_code, name, manager_id, status } = req.body;
  const allowedFields = ["project_code", "name", "manager_id", "status"];
  const bodyKeys = Object.keys(req.body);
  const hasAllowedField = bodyKeys.some((key) => allowedFields.includes(key));

  if (!hasAllowedField) {
    return res.status(400).json({
      success: false,
      message: "At least one valid field is required for update",
    });
  }

  const errors = [];
  if (project_code !== undefined && !isNonEmptyString(project_code)) errors.push("project_code must be a non-empty string");
  if (name !== undefined && !isNonEmptyString(name)) errors.push("name must be a non-empty string");
  if (manager_id !== undefined && !isNonEmptyString(manager_id)) errors.push("manager_id must be a non-empty string");
  if (status !== undefined && !isNonEmptyString(status)) errors.push("status must be a non-empty string");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(", ") });
  }

  return next();
}

function validateMemberPayload(req, res, next) {
  const { employee_id } = req.body;
  if (!isNonEmptyString(employee_id)) {
    return res.status(400).json({
      success: false,
      message: "employee_id is required",
    });
  }

  return next();
}

function validateAssetAssignmentCreate(req, res, next) {
  const { asset_id, assigned_to_type, employee_id, team_id, project_id, assigned_date, status } = req.body;
  const errors = [];
  const targetType = typeof assigned_to_type === "string" ? assigned_to_type.trim() : "";

  if (!isNonEmptyString(asset_id)) errors.push("asset_id is required");
  if (!["employee", "team", "project"].includes(targetType)) {
    errors.push("assigned_to_type must be one of employee, team, project");
  }
  if (assigned_date !== undefined && typeof assigned_date !== "string") {
    errors.push("assigned_date must be a string in YYYY-MM-DD format when provided");
  }
  if (status !== undefined && !isNonEmptyString(status)) {
    errors.push("status must be a non-empty string when provided");
  }

  if (targetType === "employee" && !isNonEmptyString(employee_id)) {
    errors.push("employee_id is required for employee assignments");
  }
  if (targetType === "team" && !isNonEmptyString(team_id)) {
    errors.push("team_id is required for team assignments");
  }
  if (targetType === "project" && !isNonEmptyString(project_id)) {
    errors.push("project_id is required for project assignments");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(", "),
    });
  }

  return next();
}

function validateIdParam(paramName = "id") {
  return (req, res, next) => {
    if (!isNonEmptyString(req.params[paramName])) {
      return res.status(400).json({
        success: false,
        message: `${paramName} is required`,
      });
    }

    return next();
  };
}

function validateTemporaryIssueCreate(req, res, next) {
  const {
    asset_id,
    employee_id,
    issued_by,
    received_by,
    purpose,
    event_name,
    issue_date,
    return_date,
    status,
  } = req.body;

  const errors = [];

  if (!isNonEmptyString(asset_id)) errors.push("asset_id is required");
  if (!isNonEmptyString(employee_id)) errors.push("employee_id is required");
  if (!isNonEmptyString(issued_by)) errors.push("issued_by is required");
  if (received_by !== undefined && received_by !== null && !isNonEmptyString(received_by)) {
    errors.push("received_by must be a non-empty string when provided");
  }
  if (!isNonEmptyString(purpose)) errors.push("purpose is required");
  if (!isNonEmptyString(event_name)) errors.push("event_name is required");
  if (issue_date && Number.isNaN(Date.parse(issue_date))) errors.push("issue_date must be a valid date");
  if (return_date && Number.isNaN(Date.parse(return_date))) errors.push("return_date must be a valid date");
  if (status && !["Active", "Returned"].includes(status)) errors.push("status must be Active or Returned");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(", "),
    });
  }

  return next();
}

function validateTemporaryIssueUpdate(req, res, next) {
  const {
    asset_id,
    employee_id,
    issued_by,
    received_by,
    purpose,
    event_name,
    issue_date,
    return_date,
    status,
  } = req.body;

  const errors = [];

  if (asset_id !== undefined && !isNonEmptyString(asset_id)) errors.push("asset_id must be a non-empty string");
  if (employee_id !== undefined && !isNonEmptyString(employee_id)) errors.push("employee_id must be a non-empty string");
  if (issued_by !== undefined && !isNonEmptyString(issued_by)) errors.push("issued_by must be a non-empty string");
  if (received_by !== undefined && received_by !== null && !isNonEmptyString(received_by)) {
    errors.push("received_by must be a non-empty string when provided");
  }
  if (purpose !== undefined && !isNonEmptyString(purpose)) errors.push("purpose must be a non-empty string");
  if (event_name !== undefined && !isNonEmptyString(event_name)) errors.push("event_name must be a non-empty string");
  if (issue_date && Number.isNaN(Date.parse(issue_date))) errors.push("issue_date must be a valid date");
  if (return_date && Number.isNaN(Date.parse(return_date))) errors.push("return_date must be a valid date");
  if (status && !["Active", "Returned"].includes(status)) errors.push("status must be Active or Returned");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(", "),
    });
  }

  return next();
}

function validateActivityLogCreate(req, res, next) {
  const { action, description, type, created_at } = req.body;
  const errors = [];

  if (!isNonEmptyString(action)) errors.push("action is required");
  if (!isNonEmptyString(description)) errors.push("description is required");
  if (!isNonEmptyString(type)) errors.push("type is required");
  if (created_at && Number.isNaN(Date.parse(created_at))) errors.push("created_at must be a valid date");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.join(", "),
    });
  }

  return next();
}

module.exports = {
  validateEmployeeCreate,
  validateEmployeeSyncPayload,
  validateEmployeeUpdate,
  validateAssetCreate,
  validateAssetUpdate,
  validateTeamCreate,
  validateTeamUpdate,
  validateProjectCreate,
  validateProjectUpdate,
  validateMemberPayload,
  validateAssetAssignmentCreate,
  validateIdParam,
  validateTemporaryIssueCreate,
  validateTemporaryIssueUpdate,
  validateActivityLogCreate,
};
