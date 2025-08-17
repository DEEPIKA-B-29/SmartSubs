// routes/user.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ Get current user reminder preference
router.get("/reminder", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("remindersEnabled");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ remindersEnabled: user.remindersEnabled });
  } catch (err) {
    console.error("GET /api/users/reminder error:", err);
    res.status(500).json({ message: "Error fetching reminder status" });
  }
});

// ✅ Toggle reminder preference
router.put("/reminder", authMiddleware, async (req, res) => {
  try {
    const { remindersEnabled } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { remindersEnabled: Boolean(remindersEnabled) },
      { new: true }
    ).select("remindersEnabled");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ remindersEnabled: user.remindersEnabled });
  } catch (err) {
    console.error("PUT /api/users/reminder error:", err);
    res.status(500).json({ message: "Error updating reminder status" });
  }
});

export default router;
