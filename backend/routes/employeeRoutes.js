const express = require("express");

const {
  listEmployees,
  fetchEmployee,
  addEmployee,
  syncEmployee,
  editEmployee,
  removeEmployee,
} = require("../controllers/employeeController");
const { requireInternalApiKey } = require("../middleware/internalApiKey");
const {
  validateEmployeeCreate,
  validateEmployeeSyncPayload,
  validateEmployeeUpdate,
  validateIdParam,
} = require("../middleware/validators");

const router = express.Router();

router.get("/", listEmployees);
router.post("/sync", requireInternalApiKey, validateEmployeeSyncPayload, syncEmployee);
router.get("/:id", validateIdParam("id"), fetchEmployee);
router.post("/", validateEmployeeCreate, addEmployee);
router.put("/:id", validateIdParam("id"), validateEmployeeUpdate, editEmployee);
router.delete("/:id", validateIdParam("id"), removeEmployee);

module.exports = router;
