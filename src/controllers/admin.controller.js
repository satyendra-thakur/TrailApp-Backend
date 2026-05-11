const adminService = require("../services/admin.service");

const getPendingApprovals = async (req, res, next) => {
  try {
    const data = await adminService.getPendingApprovals();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const moderateTrail = async (req, res, next) => {
  try {
    const data = await adminService.moderateResource(
      "trails",
      req.params.trailId,
      req.body.decision,
      req.body.moderationNote,
      req.user
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const moderateHomestay = async (req, res, next) => {
  try {
    const data = await adminService.moderateResource(
      "homestays",
      req.params.homestayId,
      req.body.decision,
      req.body.moderationNote,
      req.user
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const moderateReview = async (req, res, next) => {
  try {
    const data = await adminService.moderateResource(
      "reviews",
      req.params.reviewId,
      req.body.decision,
      req.body.moderationNote,
      req.user
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const moderateEvent = async (req, res, next) => {
  try {
    const data = await adminService.moderateResource(
      "events",
      req.params.eventId,
      req.body.decision,
      req.body.moderationNote,
      req.user
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const moderateLocalService = async (req, res, next) => {
  try {
    const data = await adminService.moderateResource(
      "localservices",
      req.params.serviceId,
      req.body.decision,
      req.body.moderationNote,
      req.user
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingApprovals,
  moderateTrail,
  moderateHomestay,
  moderateReview,
  moderateEvent,
  moderateLocalService
};
