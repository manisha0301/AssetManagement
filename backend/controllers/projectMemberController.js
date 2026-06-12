const { getEmployeeById } = require("../models/employeeModel");
const { getProjectById } = require("../models/projectModel");
const { getProjectMembers, addProjectMember, removeProjectMember } = require("../models/projectMemberModel");

async function listMembers(req, res, next) {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const members = await getProjectMembers(req.params.id);
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
    const project = await getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const employee = await getEmployeeById(req.body.employee_id);
    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const member = await addProjectMember(req.params.id, req.body.employee_id);
    return res.status(201).json({
      success: true,
      message: "Project member added successfully",
      data: member,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Employee is already a project member" });
    }
    return next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const deleted = await removeProjectMember(req.params.id, req.params.employeeId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Project member not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Project member removed successfully",
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
