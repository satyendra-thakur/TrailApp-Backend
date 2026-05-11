const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    type: {
      type: String,
      enum: [
        "trail_completed",
        "trail_created",
        "review_posted",
        "photo_uploaded",
        "achievement_unlocked"
      ],
      required: true
    },
    entityType: {
      type: String,
      enum: ["trail", "review", null],
      default: null
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    text: {
      type: String,
      default: ""
    },
    photoUrl: {
      type: String,
      default: ""
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
      ref: "User"
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

activitySchema.index({ isPublic: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
