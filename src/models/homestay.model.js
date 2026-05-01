const mongoose = require("mongoose");

const homestaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    ownerId: {
      type: String,
      required: true
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
    // B3: Map data layer fields
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    address: { type: String, trim: true, maxlength: 250, default: "" },
    region: { type: String, trim: true, maxlength: 120, default: "" },
    country: { type: String, trim: true, maxlength: 60, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined } // [lng, lat]
    },
    pricePerNight: { type: Number, min: 0, default: 0 },
    currency: { type: String, trim: true, maxlength: 6, default: "NPR" },
    capacity: { type: Number, min: 1, default: 2 },
    amenities: { type: [String], default: [] },
    photos: { type: [String], default: [] },
    contactPhone: { type: String, trim: true, maxlength: 40, default: "" },
    trailIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trail" }],
      default: []
    }
  },
  {
    timestamps: true
  }
);

homestaySchema.index({ location: "2dsphere" });
homestaySchema.index({ name: "text", description: "text", region: "text" });

module.exports = mongoose.model("Homestay", homestaySchema);
