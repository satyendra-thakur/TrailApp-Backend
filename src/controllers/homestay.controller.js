const mongoose = require("mongoose");
const Homestay = require("../models/homestay.model");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const listHomestays = async (req, res, next) => {
  try {
    const query = { approvalStatus: "approved" };
    if (req.query.search) {
      const regex = new RegExp(req.query.search, "i");
      query.$or = [{ name: regex }, { address: regex }, { description: regex }];
    }

    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [homestays, total] = await Promise.all([
      Homestay.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Homestay.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: homestays,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

const getHomestay = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw buildError("Invalid homestay id", 400);

    const homestay = await Homestay.findById(id);
    if (!homestay) throw buildError("Homestay not found", 404);

    // Only show approved homestays to the public (owner/admin could be expanded later)
    if (homestay.approvalStatus !== "approved") {
      throw buildError("Homestay not available", 403);
    }

    res.status(200).json({ success: true, data: homestay });
  } catch (error) {
    next(error);
  }
};

const createHomestay = async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    if (!name) throw buildError("name is required", 400);

    const homestay = await Homestay.create({
      name,
      ownerId: req.user.id,
      description: String(req.body.description || ""),
      address: String(req.body.address || ""),
      pricePerNight: Number(req.body.pricePerNight) || 0,
      currency: String(req.body.currency || "NPR"),
      photos: Array.isArray(req.body.photos) ? req.body.photos.map(String) : [],
      amenities: Array.isArray(req.body.amenities) ? req.body.amenities.map(String) : [],
      capacity: Number(req.body.capacity) || 2,
      contactPhone: String(req.body.contactPhone || ""),
      trailIds: Array.isArray(req.body.trailIds) ? req.body.trailIds : [],
      location:
        req.body.location && Array.isArray(req.body.location.coordinates)
          ? { type: "Point", coordinates: req.body.location.coordinates }
          : undefined,
      approvalStatus: "pending"
    });

    res.status(201).json({ success: true, data: homestay });
  } catch (error) {
    next(error);
  }
};

const updateHomestay = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw buildError("Invalid homestay id", 400);

    const homestay = await Homestay.findById(id);
    if (!homestay) throw buildError("Homestay not found", 404);

    if (homestay.ownerId !== req.user.id) {
      throw buildError("Forbidden: you do not own this homestay", 403);
    }

    const updatable = [
      "name", "description", "address", "pricePerNight", "currency",
      "photos", "amenities", "capacity", "contactPhone"
    ];

    updatable.forEach((key) => {
      if (req.body[key] !== undefined) {
        homestay[key] = req.body[key];
      }
    });

    if (req.body.location && Array.isArray(req.body.location.coordinates)) {
      homestay.location = { type: "Point", coordinates: req.body.location.coordinates };
    }

    await homestay.save();
    res.status(200).json({ success: true, data: homestay });
  } catch (error) {
    next(error);
  }
};

const deleteHomestay = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw buildError("Invalid homestay id", 400);

    const homestay = await Homestay.findById(id);
    if (!homestay) throw buildError("Homestay not found", 404);

    if (homestay.ownerId !== req.user.id) {
      throw buildError("Forbidden: you do not own this homestay", 403);
    }

    await Homestay.deleteOne({ _id: homestay._id });
    res.status(200).json({ success: true, data: { id: homestay._id } });
  } catch (error) {
    next(error);
  }
};

module.exports = { listHomestays, getHomestay, createHomestay, updateHomestay, deleteHomestay };
