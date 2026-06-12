const express = require("express");
const {
  listTemporaryIssues,
  fetchTemporaryIssue,
  listTemporaryIssuesByAsset,
  listTemporaryIssuesByEmployee,
  addTemporaryIssue,
  editTemporaryIssue,
  closeIssue,
  removeTemporaryIssue,
} = require("../controllers/temporaryIssueController");
const {
  validateIdParam,
  validateTemporaryIssueCreate,
  validateTemporaryIssueUpdate,
} = require("../middleware/validators");

const router = express.Router();

router.get("/", listTemporaryIssues);
router.post("/", validateTemporaryIssueCreate, addTemporaryIssue);
router.get("/asset/:assetId", validateIdParam("assetId"), listTemporaryIssuesByAsset);
router.get("/employee/:employeeId", validateIdParam("employeeId"), listTemporaryIssuesByEmployee);
router.get("/:id", validateIdParam("id"), fetchTemporaryIssue);
router.put("/:id", validateIdParam("id"), validateTemporaryIssueUpdate, editTemporaryIssue);
router.patch("/:id/close", validateIdParam("id"), closeIssue);
router.delete("/:id", validateIdParam("id"), removeTemporaryIssue);

module.exports = router;
