const { getUserByEmail, getAllUsers, getUserById, createUser, updateUser, updateUserPassword, deleteUser, normalizePermissions } = require("../models/authModel");
const { createSession, getSessionByRefreshTokenHash, updateSession, revokeSession } = require("../models/sessionModel");
const { verifyPassword } = require("../utils/password");
const { createAccessToken, generateRefreshToken, hashRefreshToken, REFRESH_TOKEN_TTL, getRefreshTokenExpiryDate } = require("../utils/token");
const { createHttpError } = require("../utils/httpError");

async function login(req, res, next) {
  try {
    const { email, password, remember } = req.body || {};
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

    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);
    const expiresAt = getRefreshTokenExpiryDate();
    const session = await createSession({
      userId: user.user_id,
      refreshTokenHash,
      expiresAt,
      rememberMe: Boolean(remember),
      tokenVersion: 1,
    });

    const accessToken = createAccessToken({
      userId: user.user_id,
      sessionId: session.session_id,
      tokenVersion: session.token_version,
    });

    const permissions = normalizePermissions(user.permissions, user.role);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
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

async function refreshToken(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return next(createHttpError("Refresh token is missing", 401));
    }

    const refreshTokenHash = hashRefreshToken(refreshToken);
    const session = await getSessionByRefreshTokenHash(refreshTokenHash);

    if (!session || session.revoked || new Date(session.expires_at) < new Date()) {
      return next(createHttpError("Refresh token is invalid or expired", 401));
    }

    const user = await getUserById(session.user_id);
    if (!user || !user.is_active) {
      await revokeSession(session.session_id);
      return next(createHttpError("User not found or inactive", 401));
    }

    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();
    const nextVersion = session.token_version + 1;

    await updateSession(session.session_id, {
      refreshTokenHash: newRefreshTokenHash,
      expiresAt,
      tokenVersion: nextVersion,
    });

    const accessToken = createAccessToken({
      userId: user.user_id,
      sessionId: session.session_id,
      tokenVersion: nextVersion,
    });

    const permissions = normalizePermissions(user.permissions, user.role);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res.status(200).json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken,
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

async function logout(req, res, next) {
  try {
    const sessionId = req.session?.session_id;
    if (sessionId) {
      await revokeSession(sessionId);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully" });
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
  refreshToken,
  logout,
  listUsers,
  createNewUser,
  updateExistingUser,
  changeUserPasswordHandler,
  deleteExistingUser,
};
