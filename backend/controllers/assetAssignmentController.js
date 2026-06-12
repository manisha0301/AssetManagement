const {
  getAllAssetAssignments,
  getAssetAssignmentsByAssetId,
  getAssignmentById,
  getActiveAssignmentByAssetId,
  createAssetAssignment,
  closeAssetAssignment,
} = require("../models/assetAssignmentModel");

async function listAssignments(req, res, next) {
  try {
    const assignments = await getAllAssetAssignments();
    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    return next(error);
  }
}

async function fetchAssignment(req, res, next) {
  try {
    const assignment = await getAssignmentById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    return res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    return next(error);
  }
}

async function listAssignmentsByAsset(req, res, next) {
  try {
    const assignments = await getAssetAssignmentsByAssetId(req.params.assetId);
    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    return next(error);
  }
}

async function fetchActiveAssignmentByAsset(req, res, next) {
  try {
    const assignment = await getActiveAssignmentByAssetId(req.params.assetId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Active assignment not found" });
    }

    return res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    return next(error);
  }
}

async function addAssignment(req, res, next) {
  try {
    const assignment = await createAssetAssignment(req.body);
    return res.status(201).json({
      success: true,
      message: "Asset assignment created successfully",
      data: assignment,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code || "ASSIGNMENT_ERROR",
        message: error.message,
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Assignment already exists",
      });
    }

    return next(error);
  }
}

async function closeAssignment(req, res, next) {
  try {
    const assignment = await closeAssetAssignment(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Asset assignment closed successfully",
      data: assignment,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listAssignments,
  fetchAssignment,
  listAssignmentsByAsset,
  fetchActiveAssignmentByAsset,
  addAssignment,
  closeAssignment,
};
