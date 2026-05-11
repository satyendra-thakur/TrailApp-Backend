const mongoose = require("mongoose");
const multer = require("multer");
const GPXParser = require("gpxparser");
const Trail = require("../models/trail.model");
const Checklist = require("../models/checklist.model");
const { getIo } = require("../socket");

const normalizeText = (value) => String(value || "").trim();

const buildError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const ensureObjectId = (id, label = "id") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw buildError(`Invalid ${label}`, 400);
  }
};

const sanitizeWaypoint = (raw, fallbackIndex) => {
  if (!raw || typeof raw !== "object") {
    throw buildError("Each waypoint must be an object", 400);
  }

  const name = normalizeText(raw.name);
  if (!name) {
    throw buildError("Waypoint name is required", 400);
  }

  const latitude = Number(raw.latitude);
  const longitude = Number(raw.longitude);

  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    throw buildError(`Invalid latitude for waypoint "${name}"`, 400);
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw buildError(`Invalid longitude for waypoint "${name}"`, 400);
  }

  const orderIndex = Number.isFinite(Number(raw.orderIndex))
    ? Number(raw.orderIndex)
    : fallbackIndex;

  return {
    name,
    description: normalizeText(raw.description),
    type: raw.type || "checkpoint",
    latitude,
    longitude,
    altitudeM: raw.altitudeM === undefined || raw.altitudeM === null
      ? null
      : Number(raw.altitudeM),
    orderIndex,
    arrivalEstimateMin:
      raw.arrivalEstimateMin === undefined || raw.arrivalEstimateMin === null
        ? null
        : Number(raw.arrivalEstimateMin),
    notes: normalizeText(raw.notes)
  };
};

const sanitizeEmergencyNumber = (raw) => {
  if (!raw || typeof raw !== "object") {
    throw buildError("Each emergency number must be an object", 400);
  }

  const label = normalizeText(raw.label);
  const phone = normalizeText(raw.phone);

  if (!label) {
    throw buildError("Emergency number label is required", 400);
  }
  if (!phone) {
    throw buildError("Emergency number phone is required", 400);
  }

  return {
    label,
    phone,
    type: raw.type || "other",
    country: normalizeText(raw.country)
  };
};

const assertWaypointsShape = (waypoints) => {
  if (waypoints.length < 2) {
    throw buildError(
      "A trail must have at least a start and an end waypoint",
      400
    );
  }

  const sorted = [...waypoints].sort((a, b) => a.orderIndex - b.orderIndex);
  const hasStart = sorted.some((w) => w.type === "start");
  const hasEnd = sorted.some((w) => w.type === "end");

  if (!hasStart || !hasEnd) {
    throw buildError(
      'Waypoints must include one with type "start" and one with type "end"',
      400
    );
  }
};

// Creation pipeline: validate -> sanitize -> persist
const createTrail = async (payload, userId) => {
  const name = normalizeText(payload.name);
  if (!name || name.length < 2) {
    throw buildError("Trail name must be at least 2 characters long", 400);
  }

  const waypointsInput = Array.isArray(payload.waypoints)
    ? payload.waypoints
    : [];
  const waypoints = waypointsInput.map((w, i) => sanitizeWaypoint(w, i));
  assertWaypointsShape(waypoints);

  const emergencyInput = Array.isArray(payload.emergencyNumbers)
    ? payload.emergencyNumbers
    : [];
  const emergencyNumbers = emergencyInput.map(sanitizeEmergencyNumber);

  const trail = await Trail.create({
    name,
    description: normalizeText(payload.description),
    region: normalizeText(payload.region),
    country: normalizeText(payload.country),
    difficulty: payload.difficulty || "moderate",
    distanceKm: Number(payload.distanceKm) || 0,
    estimatedDurationMin: Number(payload.estimatedDurationMin) || 0,
    elevationGainM: Number(payload.elevationGainM) || 0,
    tags: Array.isArray(payload.tags)
      ? payload.tags.map(normalizeText).filter(Boolean)
      : [],
    waypoints,
    emergencyNumbers,
    status: payload.status || "draft",
    plannedStartDate: payload.plannedStartDate
      ? new Date(payload.plannedStartDate)
      : null,
    createdBy: userId
  });

  return trail;
};

const listTrails = async (userId, filters = {}) => {
  const query = { createdBy: userId };

  if (filters.status) {
    query.status = filters.status;
  }

  return Trail.find(query).sort({ updatedAt: -1 });
};

const listPublicTrails = async (filters = {}) => {
  const query = { approvalStatus: "approved" };

  if (filters.search) {
    const regex = new RegExp(filters.search, "i");
    query.$or = [
      { name: regex },
      { region: regex },
      { description: regex },
      { tags: regex }
    ];
  }
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.country) query.country = new RegExp(filters.country, "i");
  if (filters.region) query.region = new RegExp(filters.region, "i");

  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);
  const skip = (page - 1) * limit;

  const [trails, total] = await Promise.all([
    Trail.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Trail.countDocuments(query)
  ]);

  return {
    trails,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
};

const getTrailById = async (trailId, userId) => {
  ensureObjectId(trailId, "trailId");

  const trail = await Trail.findById(trailId);
  if (!trail) {
    throw buildError("Trail not found", 404);
  }
  if (userId && trail.createdBy !== userId) {
    throw buildError("Forbidden: you do not own this trail", 403);
  }
  return trail;
};

const updateTrail = async (trailId, payload, userId) => {
  const trail = await getTrailById(trailId, userId);

  const updatable = [
    "name",
    "description",
    "region",
    "country",
    "difficulty",
    "distanceKm",
    "estimatedDurationMin",
    "elevationGainM",
    "tags",
    "status",
    "plannedStartDate"
  ];

  updatable.forEach((key) => {
    if (payload[key] === undefined) return;
    if (key === "plannedStartDate") {
      trail.plannedStartDate = payload.plannedStartDate
        ? new Date(payload.plannedStartDate)
        : null;
    } else if (typeof payload[key] === "string") {
      trail[key] = normalizeText(payload[key]);
    } else {
      trail[key] = payload[key];
    }
  });

  if (Array.isArray(payload.waypoints)) {
    const sanitized = payload.waypoints.map((w, i) => sanitizeWaypoint(w, i));
    assertWaypointsShape(sanitized);
    trail.waypoints = sanitized;
  }

  if (Array.isArray(payload.emergencyNumbers)) {
    trail.emergencyNumbers = payload.emergencyNumbers.map(
      sanitizeEmergencyNumber
    );
  }

  trail.version += 1;
  await trail.save();
  return trail;
};

const deleteTrail = async (trailId, userId) => {
  const trail = await getTrailById(trailId, userId);
  await Promise.all([
    Trail.deleteOne({ _id: trail._id }),
    Checklist.deleteMany({ trailId: trail._id })
  ]);
  return { id: trail._id };
};

const addWaypoint = async (trailId, payload, userId) => {
  const trail = await getTrailById(trailId, userId);
  const waypoint = sanitizeWaypoint(payload, trail.waypoints.length);
  trail.waypoints.push(waypoint);
  trail.version += 1;
  await trail.save();
  const io = getIo();
  if (io) io.to(`trail:${trailId}`).emit("trail:waypoints_updated", trail.waypoints);
  return trail;
};

const removeWaypoint = async (trailId, waypointId, userId) => {
  const trail = await getTrailById(trailId, userId);
  ensureObjectId(waypointId, "waypointId");

  const before = trail.waypoints.length;
  trail.waypoints = trail.waypoints.filter(
    (w) => String(w._id) !== String(waypointId)
  );
  if (trail.waypoints.length === before) {
    throw buildError("Waypoint not found", 404);
  }
  trail.version += 1;
  await trail.save();
  const io = getIo();
  if (io) io.to(`trail:${trailId}`).emit("trail:waypoints_updated", trail.waypoints);
  return trail;
};

const setEmergencyNumbers = async (trailId, numbers, userId) => {
  const trail = await getTrailById(trailId, userId);
  if (!Array.isArray(numbers)) {
    throw buildError("emergencyNumbers must be an array", 400);
  }
  trail.emergencyNumbers = numbers.map(sanitizeEmergencyNumber);
  trail.version += 1;
  await trail.save();
  const io = getIo();
  if (io) io.to(`trail:${trailId}`).emit("trail:emergency_updated", trail.emergencyNumbers);
  return trail;
};

// Offline export: one self-contained JSON bundle for client-side caching
const exportBundle = async (trailId, userId) => {
  const trail = await getTrailById(trailId, userId);
  const checklist = await Checklist.findOne({
    trailId: trail._id,
    createdBy: userId
  });

  return {
    schemaVersion: 1,
    bundledAt: new Date().toISOString(),
    trail: trail.toObject(),
    checklist: checklist ? checklist.toObject() : null
  };
};

const gpxUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single("file");

const runGpxUpload = (req, res) =>
  new Promise((resolve, reject) => {
    gpxUpload(req, res, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

const parseGpxUpload = async (req) => {
  await runGpxUpload(req, {});

  if (!req.file) {
    throw buildError('GPX file is required (field name: "file")', 400);
  }

  const filename = normalizeText(req.file.originalname);
  const xml = req.file.buffer.toString("utf-8");

  const parser = new GPXParser();
  try {
    parser.parse(xml);
  } catch {
    throw buildError("Unable to parse GPX file", 400);
  }

  const points = [];

  // Prefer tracks, then routes, then waypoints
  if (Array.isArray(parser.tracks) && parser.tracks.length > 0) {
    parser.tracks.forEach((track) => {
      (track.segments || []).forEach((seg) => {
        (seg || []).forEach((pt) => points.push(pt));
      });
    });
  } else if (Array.isArray(parser.routes) && parser.routes.length > 0) {
    parser.routes.forEach((route) => {
      (route.points || []).forEach((pt) => points.push(pt));
    });
  } else if (Array.isArray(parser.waypoints) && parser.waypoints.length > 0) {
    parser.waypoints.forEach((pt) => points.push(pt));
  }

  if (points.length < 2) {
    throw buildError("GPX must contain at least 2 points", 400);
  }

  // Downsample huge tracks to keep UI snappy
  const maxPoints = 200;
  const step = Math.ceil(points.length / maxPoints);
  const sampled = points.filter((_, idx) => idx % step === 0);

  const waypoints = sampled.map((pt, index) => {
    const name = normalizeText(pt.name) || `Point ${index + 1}`;
    const latitude = Number(pt.lat);
    const longitude = Number(pt.lon);
    const altitudeM =
      pt.ele === undefined || pt.ele === null ? null : Number(pt.ele);

    return sanitizeWaypoint(
      {
        name,
        latitude,
        longitude,
        altitudeM,
        type: "checkpoint",
        orderIndex: index
      },
      index
    );
  });

  // Mark start/end types for the creation pipeline
  waypoints[0].type = "start";
  waypoints[waypoints.length - 1].type = "end";

  const altitudes = waypoints
    .map((w) => w.altitudeM)
    .filter((v) => Number.isFinite(v));

  return {
    filename,
    totalPoints: points.length,
    sampledPoints: waypoints.length,
    altitude: altitudes.length
      ? { minM: Math.min(...altitudes), maxM: Math.max(...altitudes) }
      : null,
    waypoints
  };
};

module.exports = {
  parseGpxUpload,
  createTrail,
  listTrails,
  listPublicTrails,
  getTrailById,
  updateTrail,
  deleteTrail,
  addWaypoint,
  removeWaypoint,
  setEmergencyNumbers,
  exportBundle
};
