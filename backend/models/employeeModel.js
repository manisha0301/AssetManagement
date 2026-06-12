const pool = require("../config/db");
const { generateNextId } = require("../utils/idGenerator");

function normalizeRequiredString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalString(value) {
  const normalized = normalizeRequiredString(value);
  return normalized || null;
}

async function getAllEmployees() {
  const result = await pool.query(
    `SELECT employee_id, name, department, designation, avatar
     FROM employees
     ORDER BY employee_id ASC`
  );
  return result.rows;
}

async function getEmployeeById(employeeId) {
  const result = await pool.query(
    `SELECT employee_id, name, department, designation, avatar
     FROM employees
     WHERE employee_id = $1`,
    [employeeId]
  );
  return result.rows[0] || null;
}

async function createEmployee(employee) {
  const id = employee.employee_id || generateNextId("EMP", await getAllEmployees(), "employee_id");
  const result = await pool.query(
    `INSERT INTO employees (employee_id, name, department, designation, avatar)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING employee_id, name, department, designation, avatar`,
    [
      id,
      employee.name.trim(),
      employee.department.trim(),
      employee.designation.trim(),
      employee.avatar?.trim() || null,
    ]
  );
  return result.rows[0];
}

async function upsertEmployee(employee) {
  const result = await pool.query(
    `INSERT INTO employees (employee_id, name, department, designation, avatar)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (employee_id)
     DO UPDATE SET
       name = EXCLUDED.name,
       department = EXCLUDED.department,
       designation = EXCLUDED.designation,
       avatar = EXCLUDED.avatar
     RETURNING employee_id, name, department, designation, avatar`,
    [
      normalizeRequiredString(employee.employee_id),
      normalizeRequiredString(employee.name),
      normalizeRequiredString(employee.department),
      normalizeRequiredString(employee.designation),
      normalizeOptionalString(employee.avatar),
    ]
  );

  return result.rows[0];
}

async function updateEmployee(employeeId, updates) {
  const current = await getEmployeeById(employeeId);
  if (!current) return null;

  const next = {
    ...current,
    ...updates,
  };

  const result = await pool.query(
    `UPDATE employees
     SET name = $1,
         department = $2,
         designation = $3,
         avatar = $4
     WHERE employee_id = $5
     RETURNING employee_id, name, department, designation, avatar`,
    [
      next.name.trim(),
      next.department.trim(),
      next.designation.trim(),
      next.avatar?.trim() || null,
      employeeId,
    ]
  );

  return result.rows[0] || null;
}

async function deleteEmployee(employeeId) {
  const result = await pool.query(
    `DELETE FROM employees
     WHERE employee_id = $1
     RETURNING employee_id`,
    [employeeId]
  );
  return result.rows[0] || null;
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  upsertEmployee,
  updateEmployee,
  deleteEmployee,
};
