const express = require("express");
const router = express.Router();


//middlewares

//routes
const authRoute = require("./modules/Auth/route"); 
const userRoute = require("./modules/User/route"); 
const categoryRoute = require("./modules/Category/route"); 
const staticPageRoute = require("./modules/StaticPage/route"); 
const articleRoute = require("./modules/Article/route"); 
const fileRoute = require("./modules/File/controller");
//EndPoint

router.use("/auth", authRoute); 
router.use("/user", userRoute); 
router.use("/category", categoryRoute); 
router.use("/static-page", staticPageRoute); 
router.use("/article", articleRoute);
router.use("/file", fileRoute);


module.exports = router;
