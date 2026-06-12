const express = require("express");
const {
  listActivityLogs,
  fetchActivityLog,
  addActivityLog,
} = require("../controllers/activityLogController");
const {
  validateIdParam,
  validateActivityLogCreate,
} = require("../middleware/validators");

const router = express.Router();

router.get("/", listActivityLogs);
router.post("/", validateActivityLogCreate, addActivityLog);
router.get("/:id", validateIdParam("id"), fetchActivityLog);

module.exports = router;
