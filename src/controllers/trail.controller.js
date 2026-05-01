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
    const trails = await trailService.listTrails(req.user.id);
    res.status(200).json({ success: true, data: trails });
  } catch (error) {
    next(error);
  }
};

const getTrailById = async (req, res, next) => {
  try {
    const trail = await trailService.getTrailById(req.params.trailId, req.user.id);
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const updatePlanningStage = async (req, res, next) => {
  try {
    const trail = await trailService.updatePlanningStage(req.params.trailId, req.body, req.user.id);
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const replaceWaypoints = async (req, res, next) => {
  try {
    const trail = await trailService.replaceWaypoints(req.params.trailId, req.body, req.user.id);
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const replaceEmergencyNumbers = async (req, res, next) => {
  try {
    const trail = await trailService.replaceEmergencyNumbers(req.params.trailId, req.body, req.user.id);
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const addChecklistItem = async (req, res, next) => {
  try {
    const trail = await trailService.addChecklistItem(req.params.trailId, req.body, req.user.id);
    res.status(201).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const toggleChecklistItemPacked = async (req, res, next) => {
  try {
    const trail = await trailService.toggleChecklistItemPacked(
      req.params.trailId,
      req.params.itemId,
      req.body,
      req.user.id
    );
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const deleteChecklistItem = async (req, res, next) => {
  try {
    const trail = await trailService.deleteChecklistItem(req.params.trailId, req.params.itemId, req.user.id);
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const exportOfflineBundle = async (req, res, next) => {
  try {
    const bundle = await trailService.exportOfflineBundle(req.params.trailId, req.user.id);
    res.status(200).json({ success: true, data: bundle });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTrail,
  listTrails,
  getTrailById,
  updatePlanningStage,
  replaceWaypoints,
  replaceEmergencyNumbers,
  addChecklistItem,
  toggleChecklistItemPacked,
  deleteChecklistItem,
  exportOfflineBundle
};
