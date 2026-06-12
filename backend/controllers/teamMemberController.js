const { getEmployeeById } = require("../models/employeeModel");
const { getTeamById } = require("../models/teamModel");
const { getTeamMembers, addTeamMember, removeTeamMember } = require("../models/teamMemberModel");

async function listMembers(req, res, next) {
  try {
    const team = await getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const members = await getTeamMembers(req.params.id);
    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    return next(error);
  }
}

async function addMember(req, res, next) {
  try {
    const team = await getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const employee = await getEmployeeById(req.body.employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const member = await addTeamMember(req.params.id, req.body.employee_id);
    return res.status(201).json({
      success: true,
      message: "Team member added successfully",
      data: member,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Employee is already a team member" });
    }
    return next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    const team = await getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    const deleted = await removeTeamMember(req.params.id, req.params.employeeId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Team member not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listMembers,
  addMember,
  removeMember,
};
