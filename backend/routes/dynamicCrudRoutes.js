const express = require("express");
const models = require("../config/models");
const DynamicRecord = require("../models/DynamicRecord");
const AuditLog = require("../models/AuditLog");
const validateData = require("../utils/validation");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();



/**
 * GET all available models
 */
router.get("/models", authMiddleware, (req, res) => {
  return res.status(200).json(models);
});

/**
 * GET records by model
 */
router.get("/:model", authMiddleware, async (req, res) => {
  try {
    const { model } = req.params;

    if (!models[model]) {
      return res.status(404).json({ message: "Model not found." });
    }

    const records = await DynamicRecord.find({
      modelName: model,
      deleted: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json(records);
  } catch (error) {
    console.error("GET RECORDS ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * GET single record by model and id
 */
router.get("/:model/:id", authMiddleware, async (req, res) => {
  try {
    const { model, id } = req.params;

    if (!models[model]) {
      return res.status(404).json({ message: "Model not found." });
    }

    const record = await DynamicRecord.findOne({
      _id: id,
      modelName: model,
      deleted: false,
    });

    if (!record) {
      return res.status(404).json({ message: "Record not found." });
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error("GET SINGLE RECORD ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * CREATE record
 */
router.post("/:model", authMiddleware, async (req, res) => {
  try {
    const { model } = req.params;
    const payload = req.body || {};

    if (!models[model]) {
      return res.status(404).json({ message: "Model not found." });
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ message: "Request body is required." });
    }

    const errors = validateData(models[model], payload);

    const record = await DynamicRecord.create({
      modelName: model,
      data: payload,
      createdBy: req.user?.email || req.user?.id || "unknown",
      updatedBy: req.user?.email || req.user?.id || "unknown",
    });

    await AuditLog.create({
      action: "create",
      modelName: model,
      recordId: record._id.toString(),
      changedBy: req.user?.email || req.user?.id || "unknown",
      before: null,
      after: record,
    });

    return res.status(201).json(record);
  } catch (error) {
    console.error("CREATE RECORD ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * UPDATE record
 */
router.put("/:model/:id", authMiddleware, async (req, res) => {
  try {
    const { model, id } = req.params;
    const payload = req.body;

    if (!models[model]) {
      return res.status(404).json({ message: "Model not found." });
    }

    const existing = await DynamicRecord.findOne({
      _id: id,
      modelName: model,
      deleted: false,
    });

    if (!existing) {
      return res.status(404).json({ message: "Record not found." });
    }

    const mergedData = {
      ...existing.data,
      ...payload,
    };

    const errors = validateData(models[model], mergedData);

    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed.", errors });
    }

    const before = { ...existing.toObject() };

    existing.data = mergedData;
    existing.updatedBy = req.user?.email || req.user?.id || "unknown";

    await existing.save();

    await AuditLog.create({
      action: "update",
      modelName: model,
      recordId: existing._id.toString(),
      changedBy: req.user?.email || req.user?.id || "unknown",
      before,
      after: existing,
    });

    return res.status(200).json(existing);
  } catch (error) {
    console.error("UPDATE RECORD ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

/**
 * SOFT DELETE record
 */
router.delete("/:model/:id", authMiddleware, async (req, res) => {
  try {
    const { model, id } = req.params;

    if (!models[model]) {
      return res.status(404).json({ message: "Model not found." });
    }

    const existing = await DynamicRecord.findOne({
      _id: id,
      modelName: model,
      deleted: false,
    });

    if (!existing) {
      return res.status(404).json({ message: "Record not found." });
    }

    const before = { ...existing.toObject() };

    existing.deleted = true;
    existing.deletedAt = new Date();
    existing.deletedBy = req.user?.email || req.user?.id || "unknown";
    existing.updatedBy = req.user?.email || req.user?.id || "unknown";

    await existing.save();

    await AuditLog.create({
      action: "delete",
      modelName: model,
      recordId: existing._id.toString(),
      changedBy: req.user?.email || req.user?.id || "unknown",
      before,
      after: existing,
    });

    return res.status(200).json({ message: "Record soft deleted successfully." });
  } catch (error) {
    console.error("DELETE RECORD ERROR:", error);
    return res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;