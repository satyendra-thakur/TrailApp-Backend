const mongoose = require("mongoose");

const waypointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    kind: {
      type: String,
      enum: ["waypoint", "checkpoint", "camp", "water", "summit"],
      default: "waypoint"
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    altitudeMeters: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 280,
      default: ""
    },
    order: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { _id: false }
);

const emergencyNumberSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30
    },
    countryCode: {
      type: String,
      trim: true,
      maxlength: 6,
      default: ""
    },
    available24x7: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const checklistItemSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    category: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "general"
    },
    required: {
      type: Boolean,
      default: true
    },
    packed: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 220,
      default: ""
    }
  },
  { _id: true }
);

const trailSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    summary: {
      type: String,
      trim: true,
      maxlength: 800,
      default: ""
    },
    region: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    distanceKm: {
      type: Number,
      min: 0,
      default: 0
    },
    estimatedDurationHours: {
      type: Number,
      min: 0,
      default: 0
    },
    difficulty: {
      type: String,
      enum: ["easy", "moderate", "hard", "extreme"],
      default: "moderate"
    },
    createdBy: {
      type: String,
      required: true,
      index: true
    },
    planningStage: {
      type: String,
      enum: ["draft", "route-mapped", "safety-reviewed", "checklist-ready", "published"],
      default: "draft"
    },
    waypoints: {
      type: [waypointSchema],
      default: []
    },
    emergencyNumbers: {
      type: [emergencyNumberSchema],
      default: []
    },
    checklist: {
      type: [checklistItemSchema],
      default: []
    },
    lastOfflineExportedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Trail", trailSchema);
