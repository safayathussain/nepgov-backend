const express = require("express");
const router = express.Router();


//middlewares

//routes
const authRoute = require("./modules/Auth/route"); 
const categoryRoute = require("./modules/Category/route"); 
const staticPageRoute = require("./modules/StaticPage/route"); 
//EndPoint

router.use("/auth", authRoute); 
router.use("/category", categoryRoute); 
router.use("/static-page", staticPageRoute); 


module.exports = router;
