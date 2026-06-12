const { getUserByEmail, getAllUsers, getUserById, createUser, updateUser, updateUserPassword, deleteUser, normalizePermissions } = require("../models/authModel");
const { verifyPassword } = require("../utils/password");

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await getUserByEmail(normalizedEmail);

    if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const permissions = normalizePermissions(user.permissions, user.role);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.user_id,
          displayName: user.display_name,
          email: user.email,
          role: user.role,
          permissions,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function listUsers(req, res, next) {
  try {
    const users = (await getAllUsers()).map((user) => ({
      ...user,
      permissions: normalizePermissions(user.permissions, user.role),
    }));
    return res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    return next(error);
  }
}

async function createNewUser(req, res, next) {
  try {
    const { displayName, email, password, role, isActive = true, permissions = {} } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!displayName || !normalizedEmail || !password || !role) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email is already in use" });
    }

    const safePermissions = typeof permissions === "object" && permissions !== null ? permissions : {};
    const user = await createUser({ displayName, email: normalizedEmail, password, role, isActive, permissions: safePermissions });
    return res.status(201).json({ success: true, data: { user } });
  } catch (error) {
    return next(error);
  }
}

async function updateExistingUser(req, res, next) {
  try {
    const { id } = req.params;
    const { displayName, email, role, isActive, permissions = {} } = req.body || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!displayName || !normalizedEmail || !role || typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "Display name, email, role, and active status are required" });
    }

    const existing = await getUserById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const safePermissions = typeof permissions === "object" && permissions !== null ? permissions : existing.permissions || {};
    const user = await updateUser(id, { displayName, email: normalizedEmail, role, isActive, permissions: safePermissions });
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    return next(error);
  }
}

async function changeUserPasswordHandler(req, res, next) {
  try {
    const { id } = req.params;
    const { password } = req.body || {};

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    const existing = await getUserById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = await updateUserPassword(id, password);
    return res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    return next(error);
  }
}

async function deleteExistingUser(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await getUserById(id);

    if (!existing) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await deleteUser(id);
    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  login,
  listUsers,
  createNewUser,
  updateExistingUser,
  changeUserPasswordHandler,
  deleteExistingUser,
};
