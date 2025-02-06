function checkCookieConsent(req, res, next) {
    const cookieConsent = req.headers["x-user-consent"];
    req.cookieConsent = cookieConsent
    next();
  }
module.exports = checkCookieConsent;
  