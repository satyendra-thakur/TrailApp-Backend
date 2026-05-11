const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    trailId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "Trail",
    },
    location: { type: String, default: "" },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    maxParticipants: { type: Number, default: null },
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User",
    },
    coverPhotoUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

eventSchema.index({ approvalStatus: 1, startDate: 1 });
eventSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model("Event", eventSchema);
