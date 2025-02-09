const router = require("express").Router();
const authMiddleware = require("../../middlewares/authMiddleware");
const roleMiddleware = require("../../middlewares/roleMiddleware");
const { getAllUsers } = require("./controller");

router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllUsers);

module.exports = router;
