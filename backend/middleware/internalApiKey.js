const crypto = require("crypto");

const INTERNAL_API_KEY_HEADER = "x-internal-api-key";

function safeCompareSecrets(expected, provided) {
  if (typeof expected !== "string" || typeof provided !== "string") {
    return false;
  }

  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

function requireInternalApiKey(req, res, next) {
  const configuredKey = process.env.INTERNAL_API_KEY;
  if (!configuredKey) {
    console.error("[employee-sync] INTERNAL_API_KEY is not configured");
    return res.status(500).json({
      success: false,
      code: "INTERNAL_API_KEY_NOT_CONFIGURED",
      message: "Internal sync authentication is not configured",
    });
  }

  const providedKey = req.get(INTERNAL_API_KEY_HEADER);
  if (!safeCompareSecrets(configuredKey, providedKey)) {
    console.warn("[employee-sync] Invalid internal API key", {
      ip: req.ip,
      employee_id: req.body?.employee_id || null,
    });

    return res.status(401).json({
      success: false,
      code: "INVALID_INTERNAL_API_KEY",
      message: "Invalid internal API key",
    });
  }

  return next();
}

module.exports = {
  requireInternalApiKey,
};
