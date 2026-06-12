const express = require("express");
const {
  listAssignments,
  fetchAssignment,
  listAssignmentsByAsset,
  fetchActiveAssignmentByAsset,
  addAssignment,
  closeAssignment,
} = require("../controllers/assetAssignmentController");
const {
  validateAssetAssignmentCreate,
  validateIdParam,
} = require("../middleware/validators");

const router = express.Router();

router.get("/", listAssignments);
router.post("/", validateAssetAssignmentCreate, addAssignment);
router.get("/asset/:assetId", validateIdParam("assetId"), listAssignmentsByAsset);
router.get("/asset/:assetId/active", validateIdParam("assetId"), fetchActiveAssignmentByAsset);
router.get("/:id", validateIdParam("id"), fetchAssignment);
router.patch("/:id/close", validateIdParam("id"), closeAssignment);

module.exports = router;
