const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    destination: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    createdBy: {
      type: String,
      required: true,
      index: true
    },
    members: {
      type: [String],
      default: []
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Group", groupSchema);
