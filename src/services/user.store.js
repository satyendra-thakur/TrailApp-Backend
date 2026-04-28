const crypto = require("crypto");
const UserModel = require("../models/user.model");

const usersById = new Map();
const usersByEmail = new Map();

const create = ({ email, passwordHash, fullName, role }) => {
  const now = new Date().toISOString();
  const user = UserModel.build({
    id: crypto.randomUUID(),
    email,
    passwordHash,
    fullName,
    role,
    createdAt: now,
    updatedAt: now
  });

  usersById.set(user.id, user);
  usersByEmail.set(user.email, user.id);

  return user;
};

const getByEmail = (email) => {
  const userId = usersByEmail.get(email);
  if (!userId) {
    return null;
  }

  return usersById.get(userId) || null;
};

const getById = (id) => usersById.get(id) || null;

const getAll = () => Array.from(usersById.values());

const updateById = (id, updates) => {
  const existingUser = getById(id);
  if (!existingUser) {
    return null;
  }

  const updatedUser = {
    ...existingUser,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  usersById.set(id, updatedUser);
  return updatedUser;
};

module.exports = {
  create,
  getByEmail,
  getById,
  getAll,
  updateById
};
