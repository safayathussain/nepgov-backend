const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { getAllUsers, getUserById, deleteUser } = require("./controller");

router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);
router.get("/:id", authMiddleware, roleMiddleware(["admin"]), getUserById);
router.delete("/delete/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

module.exports = router;
