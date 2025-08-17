// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import movieRoutes from "./routes/movies.js";
import userRoutes from "./routes/user.js";
import remindersRoutes from "./routes/reminders.js"; 
import startReminderJob from "./utils/reminderJob.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount all routes
app.use("/api/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reminders", remindersRoutes); // ✅ Mount reminders route

app.get("/", (req, res) => res.send("SmartSubs backend running"));

// Connect to database and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });

    // Start reminder job only if email credentials are present
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      startReminderJob();
    } else {
      console.log("⚠️ Email credentials not found - reminder job disabled");
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
