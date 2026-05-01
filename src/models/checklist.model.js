const mongoose = require("mongoose");

const checklistItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    category: {
      type: String,
      enum: [
        "gear",
        "clothing",
        "food",
        "water",
        "medical",
        "navigation",
        "shelter",
        "documents",
        "other"
      ],
      default: "gear"
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1
    },
    isEssential: {
      type: Boolean,
      default: false
    },
    isChecked: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 250,
      default: ""
    }
  },
  { _id: true, timestamps: true }
);

const checklistSchema = new mongoose.Schema(
  {
    trailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trail",
      required: true,
      index: true
    },
    createdBy: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "Packing & Gear"
    },
    items: {
      type: [checklistItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

checklistSchema.index({ trailId: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("Checklist", checklistSchema);
