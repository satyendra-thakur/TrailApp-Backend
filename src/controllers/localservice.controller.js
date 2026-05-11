const mongoose = require("mongoose");
const LocalService = require("../models/localservice.model");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const listLocalServices = async (req, res, next) => {
  try {
    const query = { approvalStatus: "approved" };
    if (req.query.type) query.type = String(req.query.type);
    if (req.query.isVerified !== undefined) {
      query.isVerified = String(req.query.isVerified) === "true";
    }
    if (req.query.trailId) query.trailIds = req.query.trailId;
    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      query.$or = [{ name: regex }, { address: regex }, { description: regex }];
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      LocalService.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      LocalService.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: services,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

const getLocalService = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw buildError("Invalid service id", 400);
    }

    const service = await LocalService.findById(id);
    if (!service) throw buildError("Service not found", 404);

    if (service.approvalStatus !== "approved") {
      throw buildError("Service not available", 403);
    }

    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

const createLocalService = async (req, res, next) => {
  try {
    const service = await LocalService.create({
      type: String(req.body.type || "").trim(),
      name: String(req.body.name || "").trim(),
      phone: String(req.body.phone || ""),
      location: {
        type: "Point",
        coordinates: req.body.location?.coordinates || [0, 0]
      },
      address: String(req.body.address || ""),
      trailIds: Array.isArray(req.body.trailIds) ? req.body.trailIds : [],
      description: String(req.body.description || ""),
      isVerified: false,
      approvalStatus: "pending"
    });

    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

module.exports = { listLocalServices, getLocalService, createLocalService };
