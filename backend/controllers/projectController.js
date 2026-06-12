const { getEmployeeById } = require("../models/employeeModel");
const { generateNextId } = require("../utils/idGenerator");
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} = require("../models/projectModel");

async function listProjects(req, res, next) {
  try {
    const projects = await getAllProjects();
    return res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    return next(error);
  }
}

async function fetchProject(req, res, next) {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    return next(error);
  }
}

async function addProject(req, res, next) {
  try {
    if (req.body.manager_id) {
      const manager = await getEmployeeById(req.body.manager_id);
      if (!manager) {
        return res.status(404).json({ success: false, message: "Manager not found" });
      }
    }

    const project = await createProject({
      project_id: req.body.project_id || generateNextId("PRJ", await getAllProjects(), "project_id"),
      project_code: req.body.project_code,
      name: req.body.name,
      manager_id: req.body.manager_id || null,
      status: req.body.status || "Planning",
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Project code already exists" });
    }
    if (error.code === "23503") {
      return res.status(400).json({ success: false, message: "Invalid manager_id" });
    }
    return next(error);
  }
}

async function editProject(req, res, next) {
  try {
    if (req.body.manager_id) {
      const manager = await getEmployeeById(req.body.manager_id);
      if (!manager) {
        return res.status(404).json({ success: false, message: "Manager not found" });
      }
    }

    const project = await updateProject(req.params.id, {
      project_code: req.body.project_code,
      name: req.body.name,
      manager_id: req.body.manager_id,
      status: req.body.status,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error) {
    return next(error);
  }
}

async function removeProject(req, res, next) {
  try {
    const deleted = await deleteProject(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listProjects,
  fetchProject,
  addProject,
  editProject,
  removeProject,
};
