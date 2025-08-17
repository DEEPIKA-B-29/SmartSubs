// routes/reminders.js - PRODUCTION VERSION
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Subscription from "../models/Subscription.js";

const router = express.Router();

// GET /api/reminders → Shows upcoming subscription renewals in dashboard
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Get current date, set to start of day (00:00:00)
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    
    const targetDays = [3, 1]; 
    const maxDate = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000); 

    // Find subscriptions for THIS USER that expire within the next 4 days
    const subs = await Subscription.find({
      userId: req.userId, 
      expiryDate: { $gte: now, $lte: maxDate } 
    }).sort({ expiryDate: 1 }); 

    
    const reminders = subs
      .map((sub) => {
        // Calculate how many days until expiry
        const expiryDate = new Date(sub.expiryDate);
        expiryDate.setHours(0, 0, 0, 0);
        
        const diffTime = expiryDate - now; // Time difference in milliseconds
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
        
        // Only include subscriptions expiring in exactly 1 or 3 days
        if (targetDays.includes(diffDays)) {
          return {
            _id: sub._id,
            serviceName: sub.serviceName,
            expiryDate: sub.expiryDate,
            plan: sub.plan,
            daysLeft: diffDays,
            message: diffDays === 0 
              ? "Expires today!" 
              : `Expires in ${diffDays} day${diffDays > 1 ? 's' : ''}`
          };
        }
        return null; // Don't include this subscription
      })
      .filter(Boolean); // Remove null values

    
    res.json(reminders);
  } catch (err) {
    console.error("GET /api/reminders error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;