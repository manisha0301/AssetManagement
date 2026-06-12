const {
  getAllActivityLogs,
  getActivityLogById,
  createActivityLog,
} = require("../models/activityLogModel");

async function listActivityLogs(req, res, next) {
  try {
    const logs = await getAllActivityLogs();
    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return next(error);
  }
}

async function fetchActivityLog(req, res, next) {
  try {
    const log = await getActivityLogById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, message: "Activity log not found" });
    }

    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    return next(error);
  }
}

async function addActivityLog(req, res, next) {
  try {
    const log = await createActivityLog(req.body);
    return res.status(201).json({
      success: true,
      message: "Activity log created successfully",
      data: log,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listActivityLogs,
  fetchActivityLog,
  addActivityLog,
};
