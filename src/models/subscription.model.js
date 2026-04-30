const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "active", "cancelled", "expired"],
      default: "pending"
    },
    gateway: {
      type: String,
      enum: ["mock", "stripe"],
      default: "mock"
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
