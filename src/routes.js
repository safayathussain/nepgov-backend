const express = require("express");
const router = express.Router();


//middlewares

//routes
const authRoute = require("./modules/Auth/route"); 
const categoryRoute = require("./modules/Category/route"); 
//EndPoint

router.use("/auth", authRoute); 
router.use("/category", categoryRoute); 


module.exports = router;
