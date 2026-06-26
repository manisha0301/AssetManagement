const jwt = require("jsonwebtoken");
const { getUserById } = require("../models/authModel");
const { getSessionById } = require("../models/sessionModel");
const { createHttpError } = require("../utils/httpError");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(createHttpError("Authorization header is missing or invalid", 401));
  }

  const accessToken = authHeader.substring(7).trim();
  if (!accessToken) {
    return next(createHttpError("Access token is required", 401));
  }

  try {
    const payload = verifyAccessToken(accessToken);
    if (!payload || !payload.userId || !payload.sessionId || !payload.tokenVersion) {
      return next(createHttpError("Access token payload is invalid", 401));
    }

    const session = await getSessionById(payload.sessionId);
    if (!session || session.revoked || new Date(session.expires_at) < new Date()) {
      return next(createHttpError("Session is invalid or expired", 401));
    }

    if (payload.tokenVersion !== session.token_version) {
      return next(createHttpError("Access token version mismatch", 401));
    }

    const user = await getUserById(payload.userId);
    if (!user || !user.is_active) {
      return next(createHttpError("User not found or inactive", 401));
    }

    req.user = {
      id: user.user_id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };
    req.session = session;
    return next();
  } catch (error) {
    return next(createHttpError("Invalid or expired access token", 401));
  }
}

module.exports = {
  requireAuth,
};
