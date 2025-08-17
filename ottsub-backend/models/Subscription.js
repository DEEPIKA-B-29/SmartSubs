import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceName: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    plan: { type: String, required: false }, // e.g. ₹1499/year
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
