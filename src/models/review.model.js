const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    authorId: {
      type: String,
      required: true
    },
    entityType: {
      type: String,
      enum: ["trail", "homestay", "service"],
      required: true
    },
    entityId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comment: {
      type: String,
      default: ""
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    moderationNote: {
      type: String,
      default: ""
    },
    approvedBy: {
      type: String,
      default: ""
    },
    approvedAt: {
      type: Date,
      default: null
    },
    reportedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User"
    },
    reportCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ entityType: 1, entityId: 1 });
reviewSchema.index({ approvalStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
