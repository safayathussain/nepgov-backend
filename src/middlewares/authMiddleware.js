const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/function");

const authMiddleware = async (req, res, next) => {
  try {
    console.log(req)
    let token = req.cookies.accessToken || req.headers["authorization"]?.split(" ")[1] ;
    const refreshToken = req.cookies.refreshToken;
    const cookieConsent = req.headers["x-user-consent"];
    if (!token && !refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Handle refresh token scenario
    if (!token && refreshToken && cookieConsent === "accepted") {
      try {
        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET
        );
        // Generate new access token
        const newAccessToken = generateAccessToken({
          _id: decodedRefresh.id,
          role: decodedRefresh.role,
        });

        // Set new access token in cookie
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
          maxAge: 60 * 60 * 1000, // 1 hour
        });
        token = newAccessToken;
      } catch (err) {
        return res.status(401).json({ message: "Invalid Refresh Token" });
      }
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded.id;
      req.cookieConsent = cookieConsent;
      req.role = decoded.role;
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid Access Token" });
    }
  } catch (error) {
    return res.status(401).json({ message: error?.message || "Authentication Error" });
  }
};

module.exports = authMiddleware;
