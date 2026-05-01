const mongoose = require("mongoose");

const waterPointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    sourceType: {
      type: String,
      enum: ["spring", "stream", "tap", "well", "lake", "other"],
      default: "spring"
    },
    isPotable: { type: Boolean, default: false },
    isSeasonal: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true } // [lng, lat]
    },
    altitudeM: { type: Number, default: null },
    lastVerifiedAt: { type: Date, default: null },
    addedBy: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

waterPointSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("WaterPoint", waterPointSchema);
