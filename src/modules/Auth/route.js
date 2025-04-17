const express = require("express");
const {
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
  adminSignIn,
  adminlogout,
  userProfileSurvey,
  me,
} = require("./controller");
const { registerValidation, userProfileSurveyValidation } = require("./validation");
const authMiddleware = require("../../middlewares/authMiddleware");
const upload = require("../../utils/upload");

const router = express.Router();

router.post("/register", registerValidation, register);
router.post("/signin", signIn);
router.post("/admin-signin", adminSignIn);
router.post("/admin-register", adminRegister);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/verify-otp-for-pass", verifyOtpForPass);
router.post("/reset-password", resetPassword);
router.post("/change-password/:id", authMiddleware, changePassword);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/admin-logout", adminlogout);
router.post("/user-profile-survey", authMiddleware, userProfileSurveyValidation, userProfileSurvey);
router.post("/me", authMiddleware, me);
router.put(
  "/update-profile/:id",
  authMiddleware,
  upload.single("profilePicture"),
  updateProfile
);

module.exports = router;
