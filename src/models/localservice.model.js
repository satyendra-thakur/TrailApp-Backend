const mongoose = require("mongoose");

const localServiceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["guide", "hospital", "police", "pharmacy", "rescue", "transport"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },
    address: { type: String, default: "" },
    trailIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    description: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    moderationNote: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: String,
      default: "",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

localServiceSchema.index({ location: "2dsphere" });
localServiceSchema.index({ type: 1, approvalStatus: 1 });

module.exports = mongoose.model("LocalService", localServiceSchema);
