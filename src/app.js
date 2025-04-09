const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const router = require("./routes");
const connectRedis = require("./config/redis");
const path = require("path");
const checkCookieConsent = require("./middlewares/checkCookieConsent");
const { postMarkWebhook } = require("./modules/Email/webhook");
dotenv.config();


connectDB();
// const redisClient = connectRedis()
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow image access from all origins (adjust for production)
  next();
});
// app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// CORS CONFIGURATIONS
const whitelist = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3004",
  "http://localhost:3005",
  "https://account.postmarkapp.com",
  "https://postmarkapp.com",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ADMIN
];
const webhookCorsOptions = {
  origin: (origin, callback) => {
    // Allow all in dev or if no origin (server-to-server)
    if (process.env.NODE_ENV !== "production" || !origin) {
      return callback(null, true);
    }
    callback(null, true); // Optionally allow all for webhooks, or add specific checks
  },
  methods: ["POST", "OPTIONS"], // Postmark uses POST
  allowedHeaders: ["Content-Type"],
};
app.use("/api/v1/webhooks/postmark", cors(webhookCorsOptions), async(req, res) => {
  console.log("Postmark webhook received:", req.body);
  // res.status(200).send("Webhook processed");
  try {
 await postMarkWebhook(req, res)
 
 } catch (error) {
  console.error(error)
 }
});
const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    } else {
      if (whitelist.includes(origin)) {
        return callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    }
  },
  allowedHeaders: ["Content-Type", "authorization", "X-Requested-With", "x-user-consent"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
};


// Apply CORS middleware
app.use(cors(corsOptions));


app.use("/api/v1", checkCookieConsent, router);


app.use("*", (req, res) => {
  res.status(404).json({ status: "fail", data: "Route Not Found" });
});

module.exports = {app}
