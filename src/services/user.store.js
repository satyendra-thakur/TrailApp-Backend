const UserModel = require("../models/user.model");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const create = async ({ email, passwordHash, fullName, preferredLanguage, role }) => {
  const user = await UserModel.create({
    email: normalizeEmail(email),
    passwordHash,
    fullName: String(fullName || "").trim(),
    preferredLanguage: String(preferredLanguage || "en").trim() || "en",
    role: String(role || "user").trim().toLowerCase() || "user"
  });

  return user;
};

const getByEmail = async (email) => {
  return UserModel.findOne({ email: normalizeEmail(email) });
};

const getById = async (id) => {
  return UserModel.findById(id);
};

const getAll = async () => {
  return UserModel.find().sort({ createdAt: -1 });
};

const reset = async () => {
  await UserModel.deleteMany({});
};

const updateById = async (id, updates) => {
  return UserModel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true
  });
};

module.exports = {
  create,
  getByEmail,
  getById,
  getAll,
  reset,
  updateById
};
