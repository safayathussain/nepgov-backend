const { validationResult } = require("express-validator");
const authService = require("./service");
const { sendResponse } = require("../../utils/response");
const User = require("../User/model");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    const result = await authService.registerUser(req.body, "user", res);

    sendResponse(res, {
      message: "User registered successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const signIn = async (req, res) => {
  try {
    const result = await authService.signIn(
      req.body.email,
      req.body.password,
      res,
      req
    );
    sendResponse(res, { message: result.message, data: result.data });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const adminSignIn = async (req, res) => {
  try {
    const result = await authService.adminSignIn(
      req.body.email,
      req.body.password,
      res,
      req
    );
    sendResponse(res, { message: result.message, data: result.data });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const adminRegister = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body, "admin");
    sendResponse(res, {
      message: "Admin registered successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const sendOtp = async (req, res) => {
  try {
    const result = await authService.sendOtp(req.body.email);
    sendResponse(res, { message: result.message, data: result.data });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const result = await authService.verifyOtp(
      req.body.email,
      req.body.otp,
      res,
      req
    );
    sendResponse(res, {
      message: result.message,
      data: result.data,
      statusCode: result.statusCode,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const verifyOtpForPass = async (req, res) => {
  try {
    const result = await authService.verifyOtpForPass(
      req.body.email,
      req.body.otp,
      res
    );
    sendResponse(res, {
      message: result.message,
      data: result.data,
      statusCode: result.statusCode,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = await authService.resetPassword(
      req.body.email,
      req.body.newPassword,
      req.body.otp,
      res,
      req
    );
    sendResponse(res, { message: result.message, data: result.data });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};
const changePassword = async (req, res) => {
  try {
    const result = await authService.changePassword(
      req.params.id,
      req.body.oldPassword,
      req.body.newPassword,
      res
    );
    sendResponse(res, { message: result.message, data: result.data });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: "Unauthorized" });
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err)
          return res.status(403).json({ message: "Invalid refresh token" });
        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        const newAccessToken = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: "1h" }
        );
        res.cookie("accessToken", newAccessToken, {
          domain: req.domain,
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 60 * 60 * 1000, // 1 hour
        });

        return res.json({ accessToken: newAccessToken });
      }
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Internal Server Error" });
  }
};
const logout = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  sendResponse(res, { message: "logout successfully" });
};

const updateProfile = async (req, res) => {
  try {
    if (req.user !== req.params.id) {
      throw new Error("You are not allowed to update this profile");
    }
    if (req.file) {
      req.body.profilePicture = '/'+req.file.path.replace(/\\/g, "/");
    }
    const result = await authService.updateProfile(req.user, req.body);
    sendResponse(res, { message: "Profile updated", data: result.data });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  adminRegister,
  sendOtp,
  verifyOtp,
  resetPassword,
  refreshToken,
  logout,
  updateProfile,
  signIn,
  verifyOtpForPass,
  changePassword,
  adminSignIn
};
