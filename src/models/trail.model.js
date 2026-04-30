const mongoose = require("mongoose");

const waypointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    type: {
      type: String,
      enum: [
        "start",
        "checkpoint",
        "rest",
        "water",
        "shelter",
        "summit",
        "viewpoint",
        "danger",
        "end"
      ],
      default: "checkpoint"
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
    altitudeM: {
      type: Number,
      default: null
    },
    orderIndex: {
      type: Number,
      required: true,
      min: 0
    },
    arrivalEstimateMin: {
      type: Number,
      default: null,
      min: 0
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    }
  },
  { _id: true }
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
      maxlength: 40
    },
    type: {
      type: String,
      enum: ["rescue", "police", "medical", "ranger", "fire", "other"],
      default: "other"
    },
    country: {
      type: String,
      trim: true,
      maxlength: 60,
      default: ""
    }
  },
  { _id: true }
);

const trailSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    region: {
      type: String,
      trim: true,
      maxlength: 120,
      default: ""
    },
    country: {
      type: String,
      trim: true,
      maxlength: 60,
      default: ""
    },
    difficulty: {
      type: String,
      enum: ["easy", "moderate", "hard", "expert"],
      default: "moderate"
    },
    distanceKm: {
      type: Number,
      min: 0,
      default: 0
    },
    estimatedDurationMin: {
      type: Number,
      min: 0,
      default: 0
    },
    elevationGainM: {
      type: Number,
      min: 0,
      default: 0
    },
    tags: {
      type: [String],
      default: []
    },
    waypoints: {
      type: [waypointSchema],
      default: []
    },
    emergencyNumbers: {
      type: [emergencyNumberSchema],
      default: []
    },
    status: {
      type: String,
      enum: ["draft", "planned", "active", "completed", "archived"],
      default: "draft",
      index: true
    },
    plannedStartDate: {
      type: Date,
      default: null
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      index: true
    },
    createdBy: {
      type: String,
      required: true,
      index: true
    },
    version: {
      type: Number,
      default: 1,
      min: 1
    }
  },
  {
    timestamps: true
  }
);

trailSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model("Trail", trailSchema);
