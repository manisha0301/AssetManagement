const crypto = require("crypto");
const pool = require("../config/db");
const { hashPassword } = require("../utils/password");

const DEFAULT_ADMIN_USER = {
  userId: process.env.DEFAULT_ADMIN_USER_ID,
  displayName: process.env.DEFAULT_ADMIN_DISPLAY_NAME,
  email: String(process.env.DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
  password: process.env.DEFAULT_ADMIN_PASSWORD,
  role: process.env.DEFAULT_ADMIN_ROLE,
};

function generateUserId() {
  return `USR-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

async function getUserByEmail(email) {
  const result = await pool.query(
    `
      SELECT user_id, display_name, email, password_hash, role, is_active, permissions
      FROM app_users
      WHERE email = $1
      LIMIT 1
    `,
    [String(email).trim().toLowerCase()]
  );

  return result.rows[0] || null;
}

async function getAllUsers() {
  const result = await pool.query(
    `
      SELECT user_id, display_name, email, role, is_active, permissions, created_at
      FROM app_users
      ORDER BY created_at DESC
    `
  );

  return result.rows;
}

async function getUserById(userId) {
  const result = await pool.query(
    `
      SELECT user_id, display_name, email, role, is_active, permissions, created_at
      FROM app_users
      WHERE user_id = $1
      LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

async function createUser({ displayName, email, password, role, isActive = true, permissions = {} }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const passwordHash = hashPassword(password);
  const userId = generateUserId();
  const normalizedPermissions = normalizePermissions(permissions, role);

  const result = await pool.query(
    `
      INSERT INTO app_users (user_id, display_name, email, password_hash, role, is_active, permissions)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, display_name, email, role, is_active, permissions, created_at
    `,
    [userId, displayName, normalizedEmail, passwordHash, role, isActive, normalizedPermissions]
  );

  return result.rows[0];
}

function normalizePermissions(permissions, role) {
  const defaults = {
    admin: {
      view_users: true,
      edit_users: true,
      delete_users: true,
      manage_users: true,
      view_assets: true,
      edit_assets: true,
    },
    editor: {
      view_users: true,
      edit_users: true,
      delete_users: false,
      manage_users: false,
      view_assets: true,
      edit_assets: true,
    },
    viewer: {
      view_users: true,
      edit_users: false,
      delete_users: false,
      manage_users: false,
      view_assets: true,
      edit_assets: false,
    },
  };

  const normalized = typeof permissions === "object" && permissions !== null ? permissions : {};
  return { ...defaults[role] || defaults.viewer, ...normalized };
}

async function updateUser(userId, { displayName, email, role, isActive, permissions = {} }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedPermissions = normalizePermissions(permissions, role);
  const result = await pool.query(
    `
      UPDATE app_users
      SET display_name = $2,
          email = $3,
          role = $4,
          is_active = $5,
          permissions = $6
      WHERE user_id = $1
      RETURNING user_id, display_name, email, role, is_active, permissions, created_at
    `,
    [userId, displayName, normalizedEmail, role, isActive, normalizedPermissions]
  );

  return result.rows[0] || null;
}

async function updateUserPassword(userId, password) {
  const passwordHash = hashPassword(password);
  const result = await pool.query(
    `
      UPDATE app_users
      SET password_hash = $2
      WHERE user_id = $1
      RETURNING user_id, display_name, email, role, is_active, created_at
    `,
    [userId, passwordHash]
  );

  return result.rows[0] || null;
}

async function deleteUser(userId) {
  await pool.query(
    `
      DELETE FROM app_users
      WHERE user_id = $1
    `,
    [userId]
  );
}

const DEFAULT_ADMIN_PERMISSIONS = {
  view_users: true,
  edit_users: true,
  delete_users: true,
  manage_users: true,
  view_assets: true,
  edit_assets: true,
};

async function seedDefaultAdminUser() {
  const passwordHash = hashPassword(DEFAULT_ADMIN_USER.password);

  await pool.query(
    `
      INSERT INTO app_users (user_id, display_name, email, password_hash, role, is_active, permissions)
      VALUES ($1, $2, $3, $4, $5, true, $6)
      ON CONFLICT (email)
      DO UPDATE SET
        display_name = EXCLUDED.display_name,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        permissions = EXCLUDED.permissions
    `,
    [
      DEFAULT_ADMIN_USER.userId,
      DEFAULT_ADMIN_USER.displayName,
      DEFAULT_ADMIN_USER.email,
      passwordHash,
      DEFAULT_ADMIN_USER.role,
      DEFAULT_ADMIN_PERMISSIONS,
    ]
  );
}

module.exports = {
  DEFAULT_ADMIN_USER,
  getUserByEmail,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  seedDefaultAdminUser,
  normalizePermissions,
};
