const trailService = require("../services/trail.service");

const createTrail = async (req, res, next) => {
  try {
    const trail = await trailService.createTrail(req.body, req.user.id);
    res.status(201).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const listTrails = async (req, res, next) => {
  try {
    const trails = await trailService.listTrails(req.user.id, {
      status: req.query.status,
      groupId: req.query.groupId
    });
    res.status(200).json({ success: true, data: trails });
  } catch (error) {
    next(error);
  }
};

const getTrail = async (req, res, next) => {
  try {
    const trail = await trailService.getTrailById(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const updateTrail = async (req, res, next) => {
  try {
    const trail = await trailService.updateTrail(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const deleteTrail = async (req, res, next) => {
  try {
    const result = await trailService.deleteTrail(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const addWaypoint = async (req, res, next) => {
  try {
    const trail = await trailService.addWaypoint(
      req.params.id,
      req.body,
      req.user.id
    );
    res.status(201).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const removeWaypoint = async (req, res, next) => {
  try {
    const trail = await trailService.removeWaypoint(
      req.params.id,
      req.params.waypointId,
      req.user.id
    );
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const setEmergencyNumbers = async (req, res, next) => {
  try {
    const trail = await trailService.setEmergencyNumbers(
      req.params.id,
      req.body.emergencyNumbers,
      req.user.id
    );
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const exportBundle = async (req, res, next) => {
  try {
    const bundle = await trailService.exportBundle(req.params.id, req.user.id);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="trail-${req.params.id}.json"`
    );
    res.setHeader("Content-Type", "application/json");
    res.status(200).json({ success: true, data: bundle });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrail,
  listTrails,
  getTrail,
  updateTrail,
  deleteTrail,
  addWaypoint,
  removeWaypoint,
  setEmergencyNumbers,
  exportBundle
};
