const express = require("express");

const {
  listAssets,
  fetchAsset,
  addAsset,
  editAsset,
  removeAsset,
} = require("../controllers/assetController");
const {
  validateAssetCreate,
  validateAssetUpdate,
  validateIdParam,
} = require("../middleware/validators");

const router = express.Router();

router.get("/", listAssets);
router.get("/:id", validateIdParam("id"), fetchAsset);
router.post("/", validateAssetCreate, addAsset);
router.put("/:id", validateIdParam("id"), validateAssetUpdate, editAsset);
router.delete("/:id", validateIdParam("id"), removeAsset);

module.exports = router;
