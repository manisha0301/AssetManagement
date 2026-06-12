const express = require("express");
const {
  listProjects,
  fetchProject,
  addProject,
  editProject,
  removeProject,
} = require("../controllers/projectController");
const {
  listMembers,
  addMember,
  removeMember,
} = require("../controllers/projectMemberController");
const {
  validateProjectCreate,
  validateProjectUpdate,
  validateMemberPayload,
  validateIdParam,
} = require("../middleware/validators");

const router = express.Router();

router.get("/", listProjects);
router.post("/", validateProjectCreate, addProject);
router.get("/:id", validateIdParam("id"), fetchProject);
router.put("/:id", validateIdParam("id"), validateProjectUpdate, editProject);
router.delete("/:id", validateIdParam("id"), removeProject);

router.get("/:id/members", validateIdParam("id"), listMembers);
router.post("/:id/members", validateIdParam("id"), validateMemberPayload, addMember);
router.delete("/:id/members/:employeeId", validateIdParam("id"), validateIdParam("employeeId"), removeMember);

module.exports = router;
