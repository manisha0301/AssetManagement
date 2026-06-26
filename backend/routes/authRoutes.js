const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  login,
  refreshToken,
  logout,
  listUsers,
  createNewUser,
  updateExistingUser,
  changeUserPasswordHandler,
  deleteExistingUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout", requireAuth, logout);

router.get("/users", requireAuth, listUsers);
router.post("/users", requireAuth, createNewUser);
router.put("/users/:id", requireAuth, updateExistingUser);
router.patch("/users/:id/password", requireAuth, changeUserPasswordHandler);
router.delete("/users/:id", requireAuth, deleteExistingUser);

module.exports = router;
