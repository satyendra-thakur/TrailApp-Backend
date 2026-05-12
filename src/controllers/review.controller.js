const mongoose = require("mongoose");
const Review = require("../models/review.model");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const listReviews = async (req, res, next) => {
  try {
    const entityType = String(req.query.entityType || "").trim();
    const entityId = String(req.query.entityId || "").trim();

    const query = { approvalStatus: "approved" };
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;

    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Review.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const entityType = String(req.body.entityType || "").trim();
    const entityId = String(req.body.entityId || "").trim();
    const rating = Number(req.body.rating);

    if (!entityType) throw buildError("entityType is required", 400);
    if (!entityId) throw buildError("entityId is required", 400);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      throw buildError("rating must be an integer 1-5", 400);
    }

    const review = await Review.create({
      authorId: req.user.id,
      entityType,
      entityId,
      rating,
      comment: String(req.body.comment || ""),
      approvalStatus: "pending"
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
};

const reportReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw buildError("Invalid review id", 400);
    }

    const review = await Review.findById(id);
    if (!review) throw buildError("Review not found", 404);

    const userId = new mongoose.Types.ObjectId(req.user.id);
    const alreadyReported = review.reportedBy.some(
      (r) => String(r) === String(userId)
    );

    if (alreadyReported) {
      return res.status(400).json({ success: false, error: "Already reported this review" });
    }

    review.reportedBy.push(userId);
    review.reportCount = review.reportedBy.length;

    // Auto-flag for moderation if report count reaches threshold
    if (review.reportCount >= 3 && review.approvalStatus === "approved") {
      review.approvalStatus = "pending";
      review.moderationNote = `Auto-flagged: received ${review.reportCount} reports`;
    }

    await review.save();

    res.status(200).json({
      success: true,
      data: { _id: review._id, reportCount: review.reportCount, reported: true }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { listReviews, createReview, reportReview };
