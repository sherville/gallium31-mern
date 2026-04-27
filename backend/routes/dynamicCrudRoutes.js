const express = require("express");
const models = require("../config/models");
const DynamicRecord = require("../models/DynamicRecord");
const AuditLog = require("../models/AuditLog");
const validateData = require("../utils/validation");
const authMiddleware = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const router = express.Router();

const getActor = (req) => req.user?.email || req.user?.id || "unknown";

/**
 * GET /api/dynamic/models
 */
router.get("/models", authMiddleware, (req, res) => {
  return successResponse(res, "Models fetched successfully.", models);
});

/**
 * GET /api/dynamic/audit/logs
 */
router.get("/audit/logs", authMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });
    return successResponse(res, "Audit logs fetched successfully.", logs);
  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);
    return errorResponse(res, "Failed to fetch audit logs.", error.message, 500);
  }
});

/**
 * GET /api/dynamic/:model
 */
router.get("/:model", authMiddleware, async (req, res) => {
  try {
    const { model } = req.params;

    if (!models[model]) {
      return errorResponse(
        res,
        "Model not found.",
        `No model named '${model}'.`,
        404
      );
    }

    const records = await DynamicRecord.find({
      modelName: model,
      deleted: false,
    }).sort({ createdAt: -1 });

    return successResponse(res, "Records fetched successfully.", records);
  } catch (error) {
    console.error("GET RECORDS ERROR:", error);
    return errorResponse(res, "Failed to fetch records.", error.message, 500);
  }
});

/**
 * GET /api/dynamic/:model/:id
 */
router.get("/:model/:id", authMiddleware, async (req, res) => {
  try {
    const { model, id } = req.params;

    if (!models[model]) {
      return errorResponse(
        res,
        "Model not found.",
        `No model named '${model}'.`,
        404
      );
    }

    const record = await DynamicRecord.findOne({
      _id: id,
      modelName: model,
      deleted: false,
    });

    if (!record) {
      return errorResponse(
        res,
        "Record not found.",
        `No active record found with id '${id}'.`,
        404
      );
    }

    return successResponse(res, "Record fetched successfully.", record);
  } catch (error) {
    console.error("GET SINGLE RECORD ERROR:", error);
    return errorResponse(res, "Failed to fetch record.", error.message, 500);
  }
});

/**
 * POST /api/dynamic/:model
 * Admin only
 */
router.post(
  "/:model",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { model } = req.params;
      const payload = req.body || {};

      if (!models[model]) {
        return errorResponse(
          res,
          "Model not found.",
          `No model named '${model}'.`,
          404
        );
      }

      if (Object.keys(payload).length === 0) {
        return errorResponse(
          res,
          "Validation failed.",
          "Request body is required.",
          400
        );
      }

      const errors = validateData(models[model], payload);

      if (errors.length > 0) {
        return errorResponse(res, "Validation failed.", errors, 400);
      }

      const actor = getActor(req);

      const record = await DynamicRecord.create({
        modelName: model,
        data: payload,
        createdBy: actor,
        updatedBy: actor,
      });

      await AuditLog.create({
        action: "create",
        modelName: model,
        recordId: record._id.toString(),
        changedBy: actor,
        before: null,
        after: record,
      });

      return successResponse(res, "Record created successfully.", record, 201);
    } catch (error) {
      console.error("CREATE RECORD ERROR:", error);
      return errorResponse(res, "Failed to create record.", error.message, 500);
    }
  }
);

/**
 * PUT /api/dynamic/:model/:id
 * Admin only
 */
router.put(
  "/:model/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { model, id } = req.params;
      const payload = req.body || {};

      if (!models[model]) {
        return errorResponse(
          res,
          "Model not found.",
          `No model named '${model}'.`,
          404
        );
      }

      if (Object.keys(payload).length === 0) {
        return errorResponse(
          res,
          "Validation failed.",
          "Request body is required.",
          400
        );
      }

      const existing = await DynamicRecord.findOne({
        _id: id,
        modelName: model,
        deleted: false,
      });

      if (!existing) {
        return errorResponse(
          res,
          "Record not found.",
          `No active record found with id '${id}'.`,
          404
        );
      }

      const mergedData = {
        ...existing.data,
        ...payload,
      };

      const errors = validateData(models[model], mergedData);

      if (errors.length > 0) {
        return errorResponse(res, "Validation failed.", errors, 400);
      }

      const before = { ...existing.toObject() };
      const actor = getActor(req);

      existing.data = mergedData;
      existing.updatedBy = actor;

      await existing.save();

      await AuditLog.create({
        action: "update",
        modelName: model,
        recordId: existing._id.toString(),
        changedBy: actor,
        before,
        after: existing,
      });

      return successResponse(res, "Record updated successfully.", existing);
    } catch (error) {
      console.error("UPDATE RECORD ERROR:", error);
      return errorResponse(res, "Failed to update record.", error.message, 500);
    }
  }
);

/**
 * DELETE /api/dynamic/:model/:id
 * Admin only
 */
router.delete(
  "/:model/:id",
  authMiddleware,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { model, id } = req.params;

      if (!models[model]) {
        return errorResponse(
          res,
          "Model not found.",
          `No model named '${model}'.`,
          404
        );
      }

      const existing = await DynamicRecord.findOne({
        _id: id,
        modelName: model,
        deleted: false,
      });

      if (!existing) {
        return errorResponse(
          res,
          "Record not found.",
          `No active record found with id '${id}'.`,
          404
        );
      }

      const before = { ...existing.toObject() };
      const actor = getActor(req);

      existing.deleted = true;
      existing.deletedAt = new Date();
      existing.deletedBy = actor;
      existing.updatedBy = actor;

      await existing.save();

      await AuditLog.create({
        action: "delete",
        modelName: model,
        recordId: existing._id.toString(),
        changedBy: actor,
        before,
        after: existing,
      });

      return successResponse(res, "Record soft deleted successfully.", {
        id: existing._id,
        deleted: true,
        deletedAt: existing.deletedAt,
        deletedBy: existing.deletedBy,
      });
    } catch (error) {
      console.error("DELETE RECORD ERROR:", error);
      return errorResponse(res, "Failed to delete record.", error.message, 500);
    }
  }
);

module.exports = router;