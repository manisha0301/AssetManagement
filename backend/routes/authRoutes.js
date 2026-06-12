const express = require("express");

const {
  login,
  listUsers,
  createNewUser,
  updateExistingUser,
  changeUserPasswordHandler,
  deleteExistingUser,
} = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.get("/users", listUsers);
router.post("/users", createNewUser);
router.put("/users/:id", updateExistingUser);
router.patch("/users/:id/password", changeUserPasswordHandler);
router.delete("/users/:id", deleteExistingUser);

module.exports = router;
