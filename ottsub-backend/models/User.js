// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    remindersEnabled: { type: Boolean, default: true }, // ✅ Email notification preference
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
