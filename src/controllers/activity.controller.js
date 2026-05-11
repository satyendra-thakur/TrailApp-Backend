const mongoose = require("mongoose");
const Activity = require("../models/activity.model");

const listActivities = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 30, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const query = { isPublic: true };
    if (req.query.type) query.type = req.query.type;
    if (req.query.userId) {
      if (mongoose.Types.ObjectId.isValid(req.query.userId)) {
        query.userId = req.query.userId;
      }
    }

    const [activities, total] = await Promise.all([
      Activity.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Activity.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: activities,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid activity id" });
    }
    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, error: "Activity not found" });
    }
    res.status(200).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

const createActivity = async (req, res, next) => {
  try {
    const type = String(req.body.type || "").trim();
    if (!type) {
      return res.status(400).json({ success: false, error: "type is required" });
    }

    const activity = await Activity.create({
      userId: req.user.id,
      type,
      entityType: req.body.entityType ?? null,
      entityId: req.body.entityId ?? null,
      text: String(req.body.text || ""),
      photoUrl: String(req.body.photoUrl || ""),
      isPublic: req.body.isPublic !== undefined ? Boolean(req.body.isPublic) : true
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    next(error);
  }
};

const likeActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid activity id" });
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      return res.status(404).json({ success: false, error: "Activity not found" });
    }

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const alreadyLiked = activity.likes.some(
      (likeId) => String(likeId) === String(userId)
    );

    if (alreadyLiked) {
      activity.likes = activity.likes.filter(
        (likeId) => String(likeId) !== String(userId)
      );
    } else {
      activity.likes.push(userId);
    }

    await activity.save();

    res.status(200).json({
      success: true,
      data: {
        _id: activity._id,
        likes: activity.likes,
        liked: !alreadyLiked,
        likeCount: activity.likes.length
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listActivities, getActivity, createActivity, likeActivity };
