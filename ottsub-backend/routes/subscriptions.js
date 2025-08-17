// backend/routes/subscriptions.js
import express from "express";
import Subscription from "../models/Subscription.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/subscriptions  (create; disallow overlap)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { serviceName, expiryDate, plan } = req.body;

    if (!serviceName) return res.status(400).json({ message: "Service name required" });
    if (!expiryDate) return res.status(400).json({ message: "Expiry date required" });

    const svc = String(serviceName).trim();
    const newExpiry = new Date(expiryDate);
    if (isNaN(newExpiry.getTime())) {
      return res.status(400).json({ message: "Invalid expiry date" });
    }

    // find latest plan for same user+service
    const lastSub = await Subscription.findOne({
      userId: req.userId,
      serviceName: svc,
    }).sort({ expiryDate: -1 });

    // no overlap: newExpiry must be strictly after last expiry
    if (lastSub && newExpiry <= new Date(lastSub.expiryDate)) {
      const lastIso = new Date(lastSub.expiryDate).toISOString().slice(0, 10);
      return res.status(400).json({
        message: `You already have an active ${svc} plan until ${lastIso}.`,
      });
    }

    const sub = new Subscription({
      userId: req.userId,
      serviceName: svc,
      expiryDate: newExpiry,
      plan: plan ?? "", // optional
    });

    await sub.save();
    return res.json({ message: "Subscription saved", subscription: sub });
  } catch (err) {
    console.error("POST /api/subscriptions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/subscriptions  (list for user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ message: "Unauthenticated" });
    const subs = await Subscription.find({ userId: req.userId }).sort({ expiryDate: 1 });
    return res.json(subs);
  } catch (err) {
    console.error("GET /api/subscriptions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/subscriptions/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return res.status(404).json({ message: "Not found" });
    if (String(sub.userId) !== String(req.userId)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await sub.deleteOne();
    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("DELETE /api/subscriptions error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
