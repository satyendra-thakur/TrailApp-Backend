const Homestay = require("../models/homestay.model");
const Payment = require("../models/payment.model");
const Review = require("../models/review.model");
const Subscription = require("../models/subscription.model");
const Trail = require("../models/trail.model");
const userStore = require("./user.store");

const getOverview = async () => {
  const users = userStore.getAll();
  const premiumUsers = users.filter((user) => user.isPremium).length;

  const [pendingTrails, pendingHomestays, pendingReviews, activeSubscriptions, paymentStats] = await Promise.all([
    Trail.countDocuments({ approvalStatus: "pending" }),
    Homestay.countDocuments({ approvalStatus: "pending" }),
    Review.countDocuments({ approvalStatus: "pending" }),
    Subscription.countDocuments({ status: "active" }),
    Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalPayments: { $sum: 1 }
        }
      }
    ])
  ]);

  return {
    users: {
      total: users.length,
      premium: premiumUsers
    },
    moderation: {
      pendingTrails,
      pendingHomestays,
      pendingReviews
    },
    subscriptions: {
      active: activeSubscriptions
    },
    payments: paymentStats[0] || {
      totalRevenue: 0,
      totalPayments: 0
    }
  };
};

const getPremiumAnalytics = async () => {
  const plansBreakdown = await Subscription.aggregate([
    {
      $lookup: {
        from: "subscriptionplans",
        localField: "plan",
        foreignField: "_id",
        as: "plan"
      }
    },
    { $unwind: "$plan" },
    {
      $group: {
        _id: "$plan.code",
        activeSubscriptions: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0]
          }
        }
      }
    }
  ]);

  const recentPayments = await Payment.find({ status: "paid" }).sort({ createdAt: -1 }).limit(10);

  return {
    plansBreakdown,
    recentPayments
  };
};

module.exports = {
  getOverview,
  getPremiumAnalytics
};
