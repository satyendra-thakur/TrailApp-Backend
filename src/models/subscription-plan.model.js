const mongoose = require("mongoose");

const subscriptionPlanSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    price: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: "USD"
    },
    billingInterval: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly"
    },
    features: {
      offlineMaps: {
        type: Boolean,
        default: true
      },
      unlimitedTrails: {
        type: Boolean,
        default: true
      },
      advancedAnalytics: {
        type: Boolean,
        default: true
      }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
