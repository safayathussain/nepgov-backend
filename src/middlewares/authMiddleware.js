const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../utils/function");

const authMiddleware = async (req, res, next) => {
  try {
    const cookieConsent = req.headers["x-user-consent"];
    const authHeader = req.headers["authorization"]?.split(" ")[1];
    const tokens = {
      user: {
        access: req.cookies.accessToken || authHeader,
        refresh: req.cookies.refreshToken
      },
      admin: {
        access: req.cookies.adminAccessToken || authHeader,
        refresh: req.cookies.adminRefreshToken
      }
    };
    
    // Check if any token exists
    if (!tokens.user.access && !tokens.user.refresh && 
        !tokens.admin.access && !tokens.admin.refresh) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Handle refresh tokens if needed
    if (cookieConsent === "accepted") {
      // Process user refresh token
      if (!tokens.user.access && tokens.user.refresh) {
        tokens.user.access = await refreshAccessToken(
          tokens.user.refresh,
          res,
          "accessToken"
        );
      }
      
      // Process admin refresh token
      if (!tokens.admin.access && tokens.admin.refresh) {
        tokens.admin.access = await refreshAccessToken(
          tokens.admin.refresh,
          res,
          "adminAccessToken"
        );
      }
    }

    // Verify tokens and set user data
    let authenticated = false;
    
    if (tokens.user.access) {
      try {
        const decoded = jwt.verify(tokens.user.access, process.env.JWT_ACCESS_SECRET);
        req.user = decoded.id;
        req.role = decoded.role;
        req.cookieConsent = cookieConsent;
        authenticated = true;
      } catch (error) {
        // Continue to admin token check
      }
    }
    
    if (tokens.admin.access) {
      try {
        const decodedAdmin = jwt.verify(tokens.admin.access, process.env.JWT_ACCESS_SECRET);
        req.adminUser = decodedAdmin.id;
        req.adminRole = decodedAdmin.role;
        req.adminCookieConsent = cookieConsent;
        authenticated = true;
      } catch (error) {
        // Continue if user was already authenticated
        if (!authenticated) {
          // Only throw if no other authentication succeeded
          throw new Error("Invalid Admin Access Token");
        }
      }
    }
    
    if (authenticated) {
      return next();
    } else {
      return res.status(401).json({ message: "Invalid Access Token" });
    }
  } catch (error) {
    return res.status(401).json({ message: error?.message || "Authentication Error" });
  }
};

// Helper function to refresh tokens
async function refreshAccessToken(refreshToken, res, cookieName) {
  try {
    const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken({
      _id: decodedRefresh.id,
      role: decodedRefresh.role,
    });

    res.cookie(cookieName, newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    
    return newAccessToken;
  } catch (err) {
    throw new Error("Invalid Refresh Token");
  }
}

module.exports = authMiddleware;