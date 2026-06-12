const crypto = require("crypto");

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function verifyPassword(password, hashedPassword) {
  if (!password || !hashedPassword) {
    return false;
  }

  const inputHash = hashPassword(password);
  if (inputHash.length !== hashedPassword.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(inputHash, "hex"), Buffer.from(hashedPassword, "hex"));
}

module.exports = {
  hashPassword,
  verifyPassword,
};
