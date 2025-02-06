const jwt = require("jsonwebtoken");
const { redisClient } = require("../app");

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// **Generate Access Token (expires in 1 hour)**
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: "10s",
  });
};

// **Generate Refresh Token (expires in 7 days)**
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
module.exports = {
  generateToken,
  generateOTP,
  generateAccessToken,
  generateRefreshToken,
};
