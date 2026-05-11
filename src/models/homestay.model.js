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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: undefined
      }
    },
    address: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: ""
    },
    pricePerNight: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: "NPR"
    },
    photos: {
      type: [String],
      default: []
    },
    amenities: {
      type: [String],
      default: []
    },
    capacity: {
      type: Number,
      default: 2
    },
    contactPhone: {
      type: String,
      default: ""
    },
    trailIds: {
      type: [mongoose.Schema.Types.ObjectId],
      default: []
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
    }
  },
  {
    timestamps: true
  }
);

homestaySchema.index({ location: "2dsphere" });
homestaySchema.index({ approvalStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Homestay", homestaySchema);
