const mongoose = require("mongoose");
const { decryptObject } = require("../services/security.service");

const emergencyContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: ""
    },
    relationship: {
      type: String,
      trim: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    }
  },
  {
    _id: false,
    minimize: false
  }
);

const settingsSchema = new mongoose.Schema(
  {
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    tripSharingEnabled: {
      type: Boolean,
      default: false
    },
    theme: {
      type: String,
      trim: true,
      enum: ["system", "light", "dark"],
      default: "system"
    },
    timezone: {
      type: String,
      trim: true,
      default: "UTC"
    }
  },
  {
    _id: false,
    minimize: false
  }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    fullName: {
      type: String,
      trim: true,
      default: ""
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    country: {
      type: String,
      trim: true,
      default: ""
    },
    preferredLanguage: {
      type: String,
      trim: true,
      default: "en"
    },
    bio: {
      type: String,
      trim: true,
      default: ""
    },
    photoUrl: {
      type: String,
      trim: true,
      default: ""
    },
    emergencyContact: {
      type: emergencyContactSchema,
      default: () => ({})
    },
    settings: {
      type: settingsSchema,
      default: () => ({})
    },
    touristVerificationCiphertext: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    minimize: false
  }
);

userSchema.statics.toPublic = (user) => {
  if (!user) {
    return null;
  }

  const safeUser = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete safeUser.passwordHash;

  const touristVerification = decryptObject(safeUser.touristVerificationCiphertext);
  safeUser.touristVerification = touristVerification || {};
  delete safeUser.touristVerificationCiphertext;

  return safeUser;
};

module.exports = mongoose.model("User", userSchema);
