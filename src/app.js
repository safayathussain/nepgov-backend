const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const router = require("./routes");
const connectRedis = require("./config/redis");
const path = require("path");
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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// CORS CONFIGURATIONS
const whitelist = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3004",
  "http://localhost:3005",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ADMIN
];

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
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

// Apply CORS middleware
app.use(cors(corsOptions));


app.use("/api/v1", router);

app.use("*", (req, res) => {
  res.status(404).json({ status: "fail", data: "Route Not Found" });
});

module.exports = {app}
