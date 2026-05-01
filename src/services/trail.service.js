const mongoose = require("mongoose");
const Trail = require("../models/trail.model");

const normalizeText = (value) => String(value || "").trim();

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureValidTrailId = (trailId) => {
  if (!mongoose.Types.ObjectId.isValid(trailId)) {
    throw buildError("Invalid trailId", 400);
  }
};

const ensureTrailOwnership = (trail, userId) => {
  if (!trail) {
    throw buildError("Trail not found", 404);
  }

  if (trail.createdBy !== userId) {
    throw buildError("Forbidden: you can only modify your own trails", 403);
  }
};

const createTrail = async (payload, userId) => {
  const title = normalizeText(payload.title);
  const region = normalizeText(payload.region);
  const summary = normalizeText(payload.summary);
  const difficulty = normalizeText(payload.difficulty).toLowerCase() || "moderate";
  const distanceKm = Number(payload.distanceKm || 0);
  const estimatedDurationHours = Number(payload.estimatedDurationHours || 0);

  if (!title || title.length < 2) {
    throw buildError("Trail title must be at least 2 characters long", 400);
  }

  if (!region) {
    throw buildError("Trail region is required", 400);
  }

  if (!["easy", "moderate", "hard", "extreme"].includes(difficulty)) {
    throw buildError("Difficulty must be easy, moderate, hard, or extreme", 400);
  }

  const trail = await Trail.create({
    title,
    summary,
    region,
    difficulty,
    distanceKm,
    estimatedDurationHours,
    createdBy: userId,
    planningStage: "draft"
  });

  return trail;
};

const listTrails = async (userId) =>
  Trail.find({ createdBy: userId }).sort({ updatedAt: -1 });

const getTrailById = async (trailId, userId) => {
  ensureValidTrailId(trailId);
  const trail = await Trail.findById(trailId);
  ensureTrailOwnership(trail, userId);
  return trail;
};

const updatePlanningStage = async (trailId, payload, userId) => {
  const stage = normalizeText(payload.planningStage);
  const allowedStages = ["draft", "route-mapped", "safety-reviewed", "checklist-ready", "published"];

  if (!allowedStages.includes(stage)) {
    throw buildError("Invalid planningStage", 400);
  }

  const trail = await getTrailById(trailId, userId);
  trail.planningStage = stage;
  await trail.save();
  return trail;
};

const replaceWaypoints = async (trailId, payload, userId) => {
  const waypoints = Array.isArray(payload.waypoints) ? payload.waypoints : [];
  if (!waypoints.length) {
    throw buildError("waypoints array is required", 400);
  }

  const normalizedWaypoints = waypoints.map((entry, index) => {
    const name = normalizeText(entry.name);
    const kind = normalizeText(entry.kind).toLowerCase() || "waypoint";
    const latitude = Number(entry.latitude);
    const longitude = Number(entry.longitude);
    const altitudeMeters = Number(entry.altitudeMeters || 0);
    const notes = normalizeText(entry.notes);
    const order = Number(entry.order || index + 1);

    if (!name) {
      throw buildError("Each waypoint must have a name", 400);
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw buildError("Waypoint latitude must be between -90 and 90", 400);
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw buildError("Waypoint longitude must be between -180 and 180", 400);
    }

    return {
      name,
      kind: ["waypoint", "checkpoint", "camp", "water", "summit"].includes(kind)
        ? kind
        : "waypoint",
      latitude,
      longitude,
      altitudeMeters,
      notes,
      order
    };
  });

  const trail = await getTrailById(trailId, userId);
  trail.waypoints = normalizedWaypoints.sort((a, b) => a.order - b.order);
  await trail.save();
  return trail;
};

const replaceEmergencyNumbers = async (trailId, payload, userId) => {
  const emergencyNumbers = Array.isArray(payload.emergencyNumbers) ? payload.emergencyNumbers : [];

  if (!emergencyNumbers.length) {
    throw buildError("emergencyNumbers array is required", 400);
  }

  const normalizedNumbers = emergencyNumbers.map((entry) => {
    const label = normalizeText(entry.label);
    const phone = normalizeText(entry.phone);
    const countryCode = normalizeText(entry.countryCode);
    const available24x7 = Boolean(entry.available24x7);

    if (!label || !phone) {
      throw buildError("Each emergency number must include label and phone", 400);
    }

    return {
      label,
      phone,
      countryCode,
      available24x7
    };
  });

  const trail = await getTrailById(trailId, userId);
  trail.emergencyNumbers = normalizedNumbers;
  await trail.save();
  return trail;
};

const addChecklistItem = async (trailId, payload, userId) => {
  const item = normalizeText(payload.item);
  const category = normalizeText(payload.category) || "general";
  const notes = normalizeText(payload.notes);
  const required = payload.required !== false;

  if (!item) {
    throw buildError("Checklist item is required", 400);
  }

  const trail = await getTrailById(trailId, userId);
  trail.checklist.push({ item, category, notes, required, packed: false });
  await trail.save();
  return trail;
};

const toggleChecklistItemPacked = async (trailId, itemId, payload, userId) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw buildError("Invalid checklist item id", 400);
  }

  const trail = await getTrailById(trailId, userId);
  const checklistItem = trail.checklist.id(itemId);

  if (!checklistItem) {
    throw buildError("Checklist item not found", 404);
  }

  checklistItem.packed = Boolean(payload.packed);
  await trail.save();
  return trail;
};

const deleteChecklistItem = async (trailId, itemId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw buildError("Invalid checklist item id", 400);
  }

  const trail = await getTrailById(trailId, userId);
  const checklistItem = trail.checklist.id(itemId);

  if (!checklistItem) {
    throw buildError("Checklist item not found", 404);
  }

  checklistItem.deleteOne();
  await trail.save();
  return trail;
};

const exportOfflineBundle = async (trailId, userId) => {
  const trail = await getTrailById(trailId, userId);
  trail.lastOfflineExportedAt = new Date();
  await trail.save();

  return {
    bundleVersion: "1.0.0",
    exportedAt: trail.lastOfflineExportedAt,
    trail: {
      id: trail._id,
      title: trail.title,
      summary: trail.summary,
      region: trail.region,
      difficulty: trail.difficulty,
      distanceKm: trail.distanceKm,
      estimatedDurationHours: trail.estimatedDurationHours,
      planningStage: trail.planningStage,
      waypoints: trail.waypoints,
      emergencyNumbers: trail.emergencyNumbers,
      checklist: trail.checklist
    }
  };
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
