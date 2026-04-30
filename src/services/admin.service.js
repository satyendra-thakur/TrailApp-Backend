const Trail = require("../models/trail.model");
const Homestay = require("../models/homestay.model");
const Review = require("../models/review.model");

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const resources = {
  trails: Trail,
  homestays: Homestay,
  reviews: Review
};

const getPendingApprovals = async () => {
  const [trails, homestays, reviews] = await Promise.all([
    Trail.find({ approvalStatus: "pending" }).sort({ createdAt: -1 }),
    Homestay.find({ approvalStatus: "pending" }).sort({ createdAt: -1 }),
    Review.find({ approvalStatus: "pending" }).sort({ createdAt: -1 })
  ]);

  return { trails, homestays, reviews };
};

const moderateResource = async (resourceType, resourceId, decision, moderationNote, adminUser) => {
  const Model = resources[resourceType];

  if (!Model) {
    throw buildError("Unsupported moderation resource", 400);
  }

  if (!["approved", "rejected"].includes(decision)) {
    throw buildError("Decision must be approved or rejected", 400);
  }

  const document = await Model.findById(resourceId);

  if (!document) {
    throw buildError(`${resourceType.slice(0, -1)} not found`, 404);
  }

  document.approvalStatus = decision;
  document.moderationNote = String(moderationNote || "").trim();
  document.approvedBy = adminUser.id;
  document.approvedAt = new Date();

  await document.save();

  return document;
};

module.exports = {
  getPendingApprovals,
  moderateResource
};
