const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access-secret";
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || "15m";
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || "7d";

function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createAccessToken(payload) {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

function getRefreshTokenExpiryDate() {
  const normalized = String(REFRESH_TOKEN_TTL).trim().toLowerCase();
  const now = Date.now();

  if (normalized.endsWith("d")) {
    const days = Number(normalized.slice(0, -1)) || 7;
    return new Date(now + days * 24 * 60 * 60 * 1000);
  }

  if (normalized.endsWith("h")) {
    const hours = Number(normalized.slice(0, -1)) || 24;
    return new Date(now + hours * 60 * 60 * 1000);
  }

  if (normalized.endsWith("m")) {
    const minutes = Number(normalized.slice(0, -1)) || 60;
    return new Date(now + minutes * 60 * 1000);
  }

  if (normalized.endsWith("s")) {
    const seconds = Number(normalized.slice(0, -1)) || 60;
    return new Date(now + seconds * 1000);
  }

  const milliseconds = Number(normalized) || 7 * 24 * 60 * 60 * 1000;
  return new Date(now + milliseconds);
}

module.exports = {
  createAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL,
  getRefreshTokenExpiryDate,
};
