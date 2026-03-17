require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");

const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ DB connection caching (VERY IMPORTANT for Lambda)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const db = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });

  isConnected = db.connections[0].readyState === 1;
  console.log("MongoDB connected");
};

// ✅ Lambda handler
module.exports.handler = async (event, context) => {
  await connectDB();
  return serverless(app)(event, context);
};