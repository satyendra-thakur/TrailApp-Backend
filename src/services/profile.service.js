const UserModel = require("../models/user.model");
const userStore = require("./user.store");
const { encryptObject } = require("./security.service");

const editableFields = [
  "fullName",
  "phone",
  "country",
  "preferredLanguage",
  "bio",
  "photoUrl",
  "emergencyContact",
  "settings",
  "touristVerification",
  "touristMode"
];

const normalizeText = (value) => String(value || "").trim();

const pickObjectFields = (input, allowedFields) => {
  const result = {};

  allowedFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(input, field) && input[field] !== undefined) {
      result[field] = input[field];
    }
  });

  return result;
};

const sanitizeEmergencyContact = (contact) => {
  if (contact === undefined) {
    return undefined;
  }

  if (typeof contact !== "object" || contact === null || Array.isArray(contact)) {
    const error = new Error("emergencyContact must be an object");
    error.statusCode = 400;
    throw error;
  }

  return pickObjectFields(contact, ["name", "relationship", "phone", "email"]);
};

const sanitizeSettings = (settings) => {
  if (settings === undefined) {
    return undefined;
  }

  if (typeof settings !== "object" || settings === null || Array.isArray(settings)) {
    const error = new Error("settings must be an object");
    error.statusCode = 400;
    throw error;
  }

  const sanitized = pickObjectFields(settings, ["notificationsEnabled", "tripSharingEnabled", "theme", "timezone"]);

  if (Object.prototype.hasOwnProperty.call(sanitized, "theme")) {
    sanitized.theme = normalizeText(sanitized.theme) || "system";
  }

  if (Object.prototype.hasOwnProperty.call(sanitized, "timezone")) {
    sanitized.timezone = normalizeText(sanitized.timezone) || "UTC";
  }

  return sanitized;
};

const sanitizeTouristVerification = (verification) => {
  if (verification === undefined) {
    return undefined;
  }

  if (typeof verification !== "object" || verification === null || Array.isArray(verification)) {
    const error = new Error("touristVerification must be an object");
    error.statusCode = 400;
    throw error;
  }

  return pickObjectFields(verification, [
    "passportNumber",
    "passportCountry",
    "visaNumber",
    "nationality",
    "documentType",
    "documentExpiry",
    "verifiedAt"
  ]);
};

const getProfile = async (userId) => {
  const user = await userStore.getById(userId);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return UserModel.toPublic(user);
};

const updateProfile = async (userId, input) => {
  const updates = {};

  editableFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(input, field) && input[field] !== undefined) {
      updates[field] = input[field];
    }
  });

  ["fullName", "phone", "country", "preferredLanguage", "bio", "photoUrl"].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      updates[field] = normalizeText(updates[field]);
    }
  });

  if (Object.prototype.hasOwnProperty.call(updates, "emergencyContact")) {
    updates.emergencyContact = sanitizeEmergencyContact(updates.emergencyContact);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "settings")) {
    updates.settings = sanitizeSettings(updates.settings);
  }

  const touristVerificationInput = Object.prototype.hasOwnProperty.call(updates, "touristVerification")
    ? updates.touristVerification
    : updates.touristMode;

  delete updates.touristMode;
  delete updates.touristVerification;

  if (touristVerificationInput !== undefined) {
    updates.touristVerificationCiphertext = encryptObject(sanitizeTouristVerification(touristVerificationInput));
  }

  const updatedUser = await userStore.updateById(userId, updates);

  if (!updatedUser) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return UserModel.toPublic(updatedUser);
};

module.exports = {
  getProfile,
  updateProfile
};
