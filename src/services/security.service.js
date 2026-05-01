const crypto = require("crypto");
const { env } = require("../config/env");

const normalizeSecret = () => String(env.dataEncryptionSecret || env.jwtSecret || "trailapp-data-secret");

const deriveKey = () => crypto.createHash("sha256").update(normalizeSecret()).digest();

const encryptObject = (value) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(), iv);
  const payload = Buffer.from(JSON.stringify(value ?? {}), "utf8");
  const encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString("base64"), authTag.toString("base64"), encrypted.toString("base64")].join(":");
};

const decryptObject = (ciphertext) => {
  if (!ciphertext) {
    return null;
  }

  const [ivText, authTagText, encryptedText] = String(ciphertext).split(":");

  if (!ivText || !authTagText || !encryptedText) {
    return null;
  }

  try {
    const iv = Buffer.from(ivText, "base64");
    const authTag = Buffer.from(authTagText, "base64");
    const encrypted = Buffer.from(encryptedText, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey(), iv);

    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8"));
  } catch (error) {
    return null;
  }
};

module.exports = {
  encryptObject,
  decryptObject
};