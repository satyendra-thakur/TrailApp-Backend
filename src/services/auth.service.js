const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const UserModel = require("../models/user.model");
const userStore = require("./user.store");

const buildToken = (user) => {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const register = async ({ email, password, fullName }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedFullName = String(fullName || "").trim();

  if (!validateEmail(normalizedEmail)) {
    const error = new Error("A valid email is required");
    error.statusCode = 400;
    throw error;
  }

  if (!password || String(password).length < 6) {
    const error = new Error("Password must be at least 6 characters long");
    error.statusCode = 400;
    throw error;
  }

  if (await userStore.getByEmail(normalizedEmail)) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userStore.create({
    email: normalizedEmail,
    passwordHash,
    fullName: normalizedFullName
  });

  return {
    token: buildToken(user),
    user: UserModel.toPublic(user)
  };
};

const login = async ({ email, password }) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!validateEmail(normalizedEmail) || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await userStore.getByEmail(normalizedEmail);

  if (!user) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    const error = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
  }

  return {
    token: buildToken(user),
    user: UserModel.toPublic(user)
  };
};

module.exports = {
  register,
  login
};
