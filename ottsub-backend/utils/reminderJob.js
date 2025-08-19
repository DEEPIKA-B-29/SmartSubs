// utils/reminderJob.js - FIXED VERSION
import nodeCron from "node-cron";
import Subscription from "../models/Subscription.js";
import sendEmail from "./sendEmail.js";

export default function startReminderJob() {
  const raw = process.env.EXPIRY_REMINDER_DAYS || "3,1";
  const DAYS = raw
    .split(",")
    .map((s) => {
      const n = parseInt(s.trim(), 10);
      return isNaN(n) ? null : n;
    })
    .filter(Boolean);

  if (!DAYS.length) {
    console.warn(
      "⚠️ No valid EXPIRY_REMINDER_DAYS set, skipping reminder job."
    );
    return;
  }

  console.log(
    `📅 Reminder job will send emails ${DAYS.join(", ")} days before expiry`
  );

  nodeCron.schedule(
    "0 11 * * *", // 11:00 AM daily
    async () => {
      const currentTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
      console.log(`🔔 Running reminder job at ${currentTime}...`);

      try {
        const now = new Date();
        console.log(`📍 Current datetime: ${now}`);

        const maxDays = Math.max(...DAYS);
        const maxDate = new Date(
          now.getTime() + (maxDays + 1) * 24 * 60 * 60 * 1000
        );

        // Find all subscriptions expiring within the reminder window
        const subs = await Subscription.find({
          expiryDate: { $gte: now, $lte: maxDate },
        }).populate("userId", "name email remindersEnabled");

        console.log(`📋 Found ${subs.length} subscriptions in reminder window`);

        let emailsSent = 0;
        let emailsSkipped = 0;

        for (const sub of subs) {
          if (!sub.expiryDate || !sub.userId) continue;

          // Skip if user has disabled email reminders
          if (!sub.userId.remindersEnabled) {
            console.log(`⏭️ Skipping ${sub.userId.email} - reminders disabled`);
            emailsSkipped++;
            continue;
          }

          const expiryDate = new Date(sub.expiryDate);

          const diffTime = expiryDate - now;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          console.log(`📊 ${sub.serviceName} for ${sub.userId.email}:`);
          console.log(`   Expiry: ${expiryDate.toDateString()}`);
          console.log(`   Current: ${now.toDateString()}`);
          console.log(`   Days left: ${diffDays}`);
          console.log(
            `   Will send email? ${
              DAYS.includes(diffDays) ? "✅ YES" : "❌ NO"
            }`
          );

          // Send email only for specified reminder days
          if (DAYS.includes(diffDays)) {
            const subject =
              diffDays === 0
                ? `${sub.serviceName} expires today!`
                : `${sub.serviceName} expires in ${diffDays} day${
                    diffDays > 1 ? "s" : ""
                  }`;

            const text =
              diffDays === 0
                ? `Hi ${sub.userId.name || "User"},\n\nYour ${
                    sub.serviceName
                  } subscription expires TODAY (${expiryDate.toDateString()}).\n\nDon't forget to renew!\n\n- SmartSubs Team`
                : `Hi ${sub.userId.name || "User"},\n\nYour ${
                    sub.serviceName
                  } subscription expires on ${expiryDate.toDateString()} (in ${diffDays} day${
                    diffDays > 1 ? "s" : ""
                  }).\n\nTime to consider renewal!\n\n- SmartSubs Team`;

            try {
              await sendEmail(sub.userId.email, subject, text);
              console.log(
                `📧 ✅ Reminder sent: ${sub.userId.email} - ${sub.serviceName} (${diffDays} days)`
              );
              emailsSent++;
            } catch (err) {
              console.error(
                `📧 ❌ Failed to send email to ${sub.userId.email}:`,
                err.message
              );
            }
          }
        }

        console.log(
          `✅ Reminder job complete: ${emailsSent} emails sent, ${emailsSkipped} skipped (disabled)`
        );
      } catch (err) {
        console.error("❌ Reminder job failed:", err.message);
      }
    },
    {
      timezone: "Asia/Kolkata",
      scheduled: true,
    }
  );

  console.log("✅ Reminder job scheduled (daily at 11:00 AM IST)");
}
