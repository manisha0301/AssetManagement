const {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = require("../models/assetModel");

async function listAssets(req, res, next) {
  try {
    const assets = await getAllAssets();
    return res.status(200).json({
      success: true,
      count: assets.length,
      data: assets,
    });
  } catch (error) {
    return next(error);
  }
}

async function fetchAsset(req, res, next) {
  try {
    const asset = await getAssetById(req.params.id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: asset,
    });
  } catch (error) {
    return next(error);
  }
}

async function addAsset(req, res, next) {
  try {
    const asset = await createAsset(req.body);
    return res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: asset,
    });
  } catch (error) {
    if (error.code === "23505") {
      if (error.constraint && error.constraint.includes("serial_number")) {
        return res.status(409).json({
          success: false,
          message: "Serial number already exists",
        });
      }

      return res.status(409).json({
        success: false,
        message: "Asset ID already exists",
      });
    }
    return next(error);
  }
}

async function editAsset(req, res, next) {
  try {
    const asset = await updateAsset(req.params.id, req.body);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset updated successfully",
      data: asset,
    });
  } catch (error) {
    if (error.code === "23505" && error.constraint && error.constraint.includes("serial_number")) {
      return res.status(409).json({
        success: false,
        message: "Serial number already exists",
      });
    }
    return next(error);
  }
}

async function removeAsset(req, res, next) {
  try {
    const deleted = await deleteAsset(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listAssets,
  fetchAsset,
  addAsset,
  editAsset,
  removeAsset,
};
