const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, UserProfileSurvey } = require("../User/model");
const {
  generateOTP,
  generateAccessToken,
  generateRefreshToken,
} = require("../../utils/function");
const { sendEmail, getOtpEmailTemplate } = require("../../utils/email");
const connectRedis = require("../../config/redis");
const {
  accessTokenDuration,
  refreshTokenDuration,
} = require("../../utils/constants");
const redisClient = connectRedis();

const registerUser = async (userData, role = "user", res) => {
  const { email, password } = userData;
  if (await User.findOne({ email })) throw new Error("User already exists");
  const otp = generateOTP();
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    ...userData,
    password: hashedPassword,
    role,
    ...(role === "admin" && { isVerified: true }),
  });
  await redisClient.set(`otp:${email}`, otp, {
    EX: 300,
  });
  sendEmail(email, "Otp for registration", getOtpEmailTemplate(otp));

  return { data: newUser };
};
const signIn = async (email, password, res, req) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  if (user.isVerified) {
    // Set cookies for access & refresh tokens
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: accessTokenDuration,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: refreshTokenDuration,
    });
   
  }
  return {
    message: "Sign-in successful",
    data: {
      user: {
        ...user.toObject(),
        accessToken,
      },
    },
  };
};
const adminSignIn = async (email, password, res, req) => {
  const user = await User.findOne({ email, role: "admin" }).select("+password");
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  // Set cookies for access & refresh tokens
  res.cookie("adminAccessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: accessTokenDuration,
  });

  res.cookie("adminRefreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: refreshTokenDuration,
  });
  return {
    message: "Sign-in successful",
    data: {
      user: {
        ...user.toObject(),
        accessToken,
      },
    },
  };
};

const sendOtp = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  const otp = generateOTP();
  await user.save();
  await redisClient.set(`otp:${email}`, otp, {
    EX: 300,
  });
  sendEmail(email, "Otp", getOtpEmailTemplate(otp));
  return { message: "OTP sent successfully" };
};

const verifyOtp = async (email, otp, res, req) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid OTP");
  const storedOTP = await redisClient.get(`otp:${email}`);
  if (!storedOTP) throw new Error("OTP expired or not found");
  if (storedOTP !== otp) throw new Error("OTP did not matched");
  user.isVerified = true;
  await user.save();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: accessTokenDuration,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: refreshTokenDuration,
  });
  return { message: "OTP verified successfully", data: { ...user.toObject(), accessToken } };
};
const verifyOtpForPass = async (email, otp, res) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid OTP");
  const storedOTP = await redisClient.get(`otp:${email}`);
  if (!storedOTP) throw new Error("OTP expired or not found");
  if (storedOTP !== otp) throw new Error("OTP did not matched");
  await user.save();

  return { message: "OTP verified successfully", data: { success: true } };
};

const resetPassword = async (email, newPassword, otp, res, req) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");
  const storedOTP = await redisClient.get(`otp:${email}`);
  if (!storedOTP) {
    throw new Error("Reset password is no longer valid");
  }
  if (storedOTP !== otp) throw new Error("OTP did not matched");
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: refreshTokenDuration,
  });
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: accessTokenDuration,
  });
  return {
    message: "Password reset successfully",
    data: { user, accessToken },
  };
};
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  // Hash and update the new password
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return {
    message: "Password changed successfully",
    data: { user },
  };
};

const updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new Error("User not found");
  return { data: user };
};
const userProfileSurvey = async (userId, data) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  const existedSurveyResponse = await UserProfileSurvey.findOne({ userId });
  console.log(existedSurveyResponse);
  if (existedSurveyResponse) throw new Error("User already submitted survey");
  const response = await UserProfileSurvey.create({ ...data, userId });
  return { data: response };
};

module.exports = {
  registerUser,
  signIn,
  sendOtp,
  verifyOtp,
  resetPassword,
  updateProfile,
  verifyOtpForPass,
  changePassword,
  adminSignIn,
  userProfileSurvey,
};
