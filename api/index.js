// index.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path"); // 1. Import the 'path' module
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const contributionRoutes = require("./routes/contribution.routes");

const app = express();

// Connect to Database
connectDB();

// Core Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  }),
);

// 2. Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test Route
app.get("/api/test", (req, res) => {
  res.json("test ok");
});

// API Routes
app.use("/api", authRoutes);
app.use("/api", eventRoutes);
app.use("/api", contributionRoutes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is listening at port no ${port} 🚀`);
});
