const express = require("express");
const router = express.Router();


//middlewares

//routes
const authRoute = require("./modules/Auth/route"); 
//EndPoint

router.use("/auth", authRoute); 


module.exports = router;
