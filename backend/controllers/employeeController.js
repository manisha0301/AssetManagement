const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  upsertEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../models/employeeModel");

async function listEmployees(req, res, next) {
  try {
    const employees = await getAllEmployees();
    return res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    return next(error);
  }
}

async function fetchEmployee(req, res, next) {
  try {
    const employee = await getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return next(error);
  }
}

async function addEmployee(req, res, next) {
  try {
    const employee = await createEmployee(req.body);
    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Employee ID already exists",
      });
    }
    return next(error);
  }
}

async function syncEmployee(req, res, next) {
  try {
    const employee = req.employeeSyncPayload;
    if (!employee) {
      console.error("[employee-sync] Normalized payload missing after validation");
      return res.status(500).json({
        success: false,
        code: "EMPLOYEE_SYNC_FAILED",
        message: "Employee sync payload could not be processed",
      });
    }

    console.info("[employee-sync] Incoming sync request", {
      employee_id: employee.employee_id,
      department: employee.department,
      designation: employee.designation,
    });

    const syncedEmployee = await upsertEmployee(employee);

    return res.status(200).json({
      success: true,
      message: "Employee synced successfully",
      data: syncedEmployee,
    });
  } catch (error) {
    console.error("[employee-sync] Failed to sync employee", {
      employee_id: req.employeeSyncPayload?.employee_id || req.body?.employee_id || null,
      code: error.code || null,
      message: error.message,
    });

    return res.status(500).json({
      success: false,
      code: "EMPLOYEE_SYNC_FAILED",
      message: "Failed to sync employee",
    });
  }
}

async function editEmployee(req, res, next) {
  try {
    const employee = await updateEmployee(req.params.id, req.body);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    return next(error);
  }
}

async function removeEmployee(req, res, next) {
  try {
    const deleted = await deleteEmployee(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listEmployees,
  fetchEmployee,
  addEmployee,
  syncEmployee,
  editEmployee,
  removeEmployee,
};
