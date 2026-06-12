const { createHttpError } = require("../utils/httpError");
const { generateNextId } = require("../utils/idGenerator");
const { getEmployeeById } = require("../models/employeeModel");
const {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
} = require("../models/teamModel");

async function listTeams(req, res, next) {
  try {
    const teams = await getAllTeams();
    return res.status(200).json({
      success: true,
      count: teams.length,
      data: teams,
    });
  } catch (error) {
    return next(error);
  }
}

async function fetchTeam(req, res, next) {
  try {
    const team = await getTeamById(req.params.id);
    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    return next(error);
  }
}

async function addTeam(req, res, next) {
  try {
    if (req.body.manager_id) {
      const manager = await getEmployeeById(req.body.manager_id);
      if (!manager) {
        return res.status(404).json({ success: false, message: "Manager not found" });
      }
    }

    const teamId = req.body.team_id || generateNextId("RND", await getAllTeams(), "team_id");
    const team = await createTeam({
      team_id: teamId,
      name: req.body.name,
      manager_id: req.body.manager_id || null,
      description: req.body.description || null,
    });

    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Team already exists" });
    }
    if (error.code === "23503") {
      return res.status(400).json({ success: false, message: "Invalid manager_id" });
    }
    return next(error);
  }
}

async function editTeam(req, res, next) {
  try {
    if (req.body.manager_id) {
      const manager = await getEmployeeById(req.body.manager_id);
      if (!manager) {
        return res.status(404).json({ success: false, message: "Manager not found" });
      }
    }

    const team = await updateTeam(req.params.id, {
      name: req.body.name,
      manager_id: req.body.manager_id,
      description: req.body.description,
    });

    if (!team) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: team,
    });
  } catch (error) {
    return next(error);
  }
}

async function removeTeam(req, res, next) {
  try {
    const deleted = await deleteTeam(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Team not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTeams,
  fetchTeam,
  addTeam,
  editTeam,
  removeTeam,
};
