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
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "1h",
    }
  );
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
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

const isLive = (start, end) => {
  const currentDate = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  return currentDate >= startDate && currentDate <= endDate;
};
 
module.exports = {
  generateToken,
  generateOTP,
  generateAccessToken,
  generateRefreshToken,
  calculateAge,
  isLive,
};
