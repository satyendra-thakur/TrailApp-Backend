const mongoose = require("mongoose");
const Event = require("../models/event.model");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const listEvents = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const query = { approvalStatus: "approved" };
    if (req.query.status) query.status = req.query.status;

    const [events, total] = await Promise.all([
      Event.find(query).sort({ startDate: 1 }).skip(skip).limit(limit),
      Event.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: events,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

const getEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw buildError("Invalid event id", 400);
    }

    const event = await Event.findById(id);
    if (!event) throw buildError("Event not found", 404);

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) throw buildError("title is required", 400);
    if (!req.body.startDate) throw buildError("startDate is required", 400);

    const event = await Event.create({
      title,
      description: String(req.body.description || ""),
      createdBy: req.user.id,
      trailId: req.body.trailId ?? null,
      location: String(req.body.location || ""),
      coordinates:
        req.body.coordinates && Array.isArray(req.body.coordinates.coordinates)
          ? {
              type: "Point",
              coordinates: req.body.coordinates.coordinates
            }
          : undefined,
      startDate: new Date(req.body.startDate),
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      maxParticipants:
        req.body.maxParticipants === undefined || req.body.maxParticipants === null
          ? null
          : Number(req.body.maxParticipants),
      coverPhotoUrl: String(req.body.coverPhotoUrl || ""),
      approvalStatus: "pending"
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const joinEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw buildError("Invalid event id", 400);
    }

    const event = await Event.findById(id);
    if (!event) throw buildError("Event not found", 404);
    if (event.approvalStatus !== "approved") {
      throw buildError("Event is not available", 403);
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const alreadyJoined = event.participants.some(
      (p) => String(p) === String(userId)
    );

    if (alreadyJoined) {
      return res.status(400).json({ success: false, error: "Already joined this event" });
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({ success: false, error: "Event is full" });
    }

    event.participants.push(userId);
    await event.save();

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

const leaveEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw buildError("Invalid event id", 400);
    }

    const event = await Event.findById(id);
    if (!event) throw buildError("Event not found", 404);

    const userId = String(req.user.id);
    const before = event.participants.length;
    event.participants = event.participants.filter(
      (p) => String(p) !== userId
    );

    if (event.participants.length === before) {
      return res.status(400).json({ success: false, error: "Not a participant" });
    }

    await event.save();
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
};

module.exports = { listEvents, getEvent, createEvent, joinEvent, leaveEvent };
