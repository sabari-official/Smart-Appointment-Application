const OTP = require('../models/OTP');
const { OTP_EXPIRE_MINUTES } = require('../config/constants');

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function createOTP(email) {
  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRE_MINUTES * 60 * 1000);
  await OTP.deleteMany({ email });
  await OTP.create({ email, code, expiresAt });
  return code;
}

async function verifyOTP(email, code) {
  const otp = await OTP.findOne({ email, code }).sort({ expiresAt: -1 });
  if (!otp) return false;
  if (new Date() > otp.expiresAt) return false;
  await OTP.deleteOne({ _id: otp._id });
  return true;
}

module.exports = { generateCode, createOTP, verifyOTP };
