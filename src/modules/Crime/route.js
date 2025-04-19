const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const {
  createCrime,
  getAllCrimes,
  getCrimeById,
  deleteCrime,
  markCrimeAsSeen,
  markAllAsSeen,
  getAllCrimeTypes,
  setCrimeTypes,
} = require("./controller");
const { createCrimeValidation } = require("./validation");

// Public routes
router.post("/create", createCrimeValidation, createCrime);
router.get("/types", getAllCrimeTypes);

// Protected routes
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllCrimes);
router.post("/types/set", authMiddleware, roleMiddleware(["admin"]), setCrimeTypes);
router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteCrime
);
router.patch(
  "/seen/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  markCrimeAsSeen
);
router.patch(
  "/mark-all-as-seen",
  authMiddleware,
  roleMiddleware(["admin"]),
  markAllAsSeen
);
router.get("/:id", authMiddleware, roleMiddleware(["admin"]), getCrimeById);

module.exports = router;
