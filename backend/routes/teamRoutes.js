const express = require("express");
const {
  listTeams,
  fetchTeam,
  addTeam,
  editTeam,
  removeTeam,
} = require("../controllers/teamController");
const {
  listMembers,
  addMember,
  removeMember,
} = require("../controllers/teamMemberController");
const {
  validateTeamCreate,
  validateTeamUpdate,
  validateMemberPayload,
  validateIdParam,
} = require("../middleware/validators");

const router = express.Router();

router.get("/", listTeams);
router.post("/", validateTeamCreate, addTeam);
router.get("/:id", validateIdParam("id"), fetchTeam);
router.put("/:id", validateIdParam("id"), validateTeamUpdate, editTeam);
router.delete("/:id", validateIdParam("id"), removeTeam);

router.get("/:id/members", validateIdParam("id"), listMembers);
router.post("/:id/members", validateIdParam("id"), validateMemberPayload, addMember);
router.delete("/:id/members/:employeeId", validateIdParam("id"), validateIdParam("employeeId"), removeMember);

module.exports = router;
