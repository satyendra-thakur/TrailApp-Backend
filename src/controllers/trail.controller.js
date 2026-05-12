const trailService = require("../services/trail.service");

const uploadGpx = async (req, res, next) => {
  try {
    const result = await trailService.parseGpxUpload(req, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

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
      status: req.query.status
    });
    res.status(200).json({ success: true, data: trails });
  } catch (error) {
    next(error);
  }
};

const listPublicTrails = async (req, res, next) => {
  try {
    const result = await trailService.listPublicTrails({
      search: req.query.search,
      difficulty: req.query.difficulty,
      country: req.query.country,
      region: req.query.region,
      page: req.query.page,
      limit: req.query.limit
    });
    res.status(200).json({ success: true, data: result.trails, pagination: result.pagination });
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

// B3: GPX/KML import. Body is raw XML (text/xml or application/gpx+xml or application/vnd.google-earth.kml+xml).
const importGpx = async (req, res, next) => {
  try {
    const xml = typeof req.body === "string" ? req.body : req.body && req.body.xml;
    const trail = await trailService.importFromGpx(req.params.id, xml, req.user.id);
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const importKml = async (req, res, next) => {
  try {
    const xml = typeof req.body === "string" ? req.body : req.body && req.body.xml;
    const trail = await trailService.importFromKml(req.params.id, xml, req.user.id);
    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    next(error);
  }
};

const getElevationGraph = async (req, res, next) => {
  try {
    const graph = await trailService.getElevationGraph(req.params.id);
    res.status(200).json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
};

const findNear = async (req, res, next) => {
  try {
    const trails = await trailService.findTrailsNear({
      lng: req.query.lng,
      lat: req.query.lat,
      radiusKm: req.query.radiusKm,
      limit: req.query.limit
    });
    res.status(200).json({ success: true, data: trails });
  } catch (error) {
    next(error);
  }
};

const findInBbox = async (req, res, next) => {
  try {
    const trails = await trailService.findTrailsInBbox({
      minLng: req.query.minLng,
      minLat: req.query.minLat,
      maxLng: req.query.maxLng,
      maxLat: req.query.maxLat,
      limit: req.query.limit
    });
    res.status(200).json({ success: true, data: trails });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadGpx,
  createTrail,
  listTrails,
  listPublicTrails,
  getTrail,
  updateTrail,
  deleteTrail,
  addWaypoint,
  removeWaypoint,
  setEmergencyNumbers,
  exportBundle,
  // B3
  importGpx,
  importKml,
  getElevationGraph,
  findNear,
  findInBbox
};
