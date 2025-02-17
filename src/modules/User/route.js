const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { getAllUsers, getUserById } = require("./controller");

router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);
router.get("/:id", authMiddleware, roleMiddleware(["admin"]), getUserById);

module.exports = router;
