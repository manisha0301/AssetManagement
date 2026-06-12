const express = require("express");
const cors = require("cors");

const employeeRoutes = require("./routes/employeeRoutes");
const assetRoutes = require("./routes/assetRoutes");
const teamRoutes = require("./routes/teamRoutes");
const projectRoutes = require("./routes/projectRoutes");
const assetAssignmentRoutes = require("./routes/assetAssignmentRoutes");
const temporaryIssueRoutes = require("./routes/temporaryIssueRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const authRoutes = require("./routes/authRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Asset Management API is running",
  });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/asset-assignments", assetAssignmentRoutes);
app.use("/api/temporary-issues", temporaryIssueRoutes);
app.use("/api/activity-logs", activityLogRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
