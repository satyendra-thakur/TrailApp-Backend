const mongoose = require("mongoose");

const dangerZoneSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    hazardType: {
      type: String,
      enum: [
        "rockfall",
        "avalanche",
        "wildlife",
        "weather",
        "exposure",
        "river-crossing",
        "altitude",
        "other"
      ],
      default: "other"
    },
    severity: {
      type: String,
      enum: ["low", "moderate", "high", "critical"],
      default: "moderate"
    },
    // Polygon = an area of effect; alternative: Point + radiusM
    geometry: {
      type: {
        type: String,
        enum: ["Point", "Polygon"],
        required: true
      },
      coordinates: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      }
    },
    radiusM: { type: Number, min: 0, default: 0 }, // used when geometry.type === "Point"
    activeFrom: { type: Date, default: null },
    activeUntil: { type: Date, default: null },
    reportedBy: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

dangerZoneSchema.index({ geometry: "2dsphere" });

module.exports = mongoose.model("DangerZone", dangerZoneSchema);
