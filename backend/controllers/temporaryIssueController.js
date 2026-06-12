const {
  getAllTemporaryIssues,
  getTemporaryIssueById,
  getTemporaryIssuesByAssetId,
  getTemporaryIssuesByEmployeeId,
  createTemporaryIssue,
  updateTemporaryIssue,
  closeTemporaryIssue,
  deleteTemporaryIssue,
} = require("../models/temporaryIssueModel");

async function listTemporaryIssues(req, res, next) {
  try {
    const issues = await getAllTemporaryIssues();
    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    return next(error);
  }
}

async function fetchTemporaryIssue(req, res, next) {
  try {
    const issue = await getTemporaryIssueById(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Temporary issue not found" });
    }

    return res.status(200).json({ success: true, data: issue });
  } catch (error) {
    return next(error);
  }
}

async function listTemporaryIssuesByAsset(req, res, next) {
  try {
    const issues = await getTemporaryIssuesByAssetId(req.params.assetId);
    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    return next(error);
  }
}

async function listTemporaryIssuesByEmployee(req, res, next) {
  try {
    const issues = await getTemporaryIssuesByEmployeeId(req.params.employeeId);
    return res.status(200).json({
      success: true,
      count: issues.length,
      data: issues,
    });
  } catch (error) {
    return next(error);
  }
}

async function addTemporaryIssue(req, res, next) {
  try {
    const issue = await createTemporaryIssue(req.body);
    return res.status(201).json({
      success: true,
      message: "Temporary issue created successfully",
      data: issue,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    return next(error);
  }
}

async function editTemporaryIssue(req, res, next) {
  try {
    const issue = await updateTemporaryIssue(req.params.id, req.body);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Temporary issue not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Temporary issue updated successfully",
      data: issue,
    });
  } catch (error) {
    return next(error);
  }
}

async function closeIssue(req, res, next) {
  try {
    const issue = await closeTemporaryIssue(req.params.id);
    if (!issue) {
      return res.status(404).json({ success: false, message: "Temporary issue not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Temporary issue closed successfully",
      data: issue,
    });
  } catch (error) {
    return next(error);
  }
}

async function removeTemporaryIssue(req, res, next) {
  try {
    const deleted = await deleteTemporaryIssue(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Temporary issue not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Temporary issue deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listTemporaryIssues,
  fetchTemporaryIssue,
  listTemporaryIssuesByAsset,
  listTemporaryIssuesByEmployee,
  addTemporaryIssue,
  editTemporaryIssue,
  closeIssue,
  removeTemporaryIssue,
};
