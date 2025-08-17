import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";

const ALL_OTTS = [
  "Netflix",
  "Prime Video",
  "Disney+ Hotstar",
  "Zee5",
  "SonyLIV",
  "Aha",
  "MX Player",
  "Hotstar",
];

export default function ProfileSetup() {
  const { token, user } = useAuth();
  const [otts, setOtts] = useState([]); // { service, expiry, price }
  const [loading, setLoading] = useState(false);

  // Load existing subscriptions from backend - BUT DON'T AUTO-POPULATE THE FORM
  // The form should start empty each time
  useEffect(() => {
    // Always start with empty form
    setOtts([]);
  }, [token, user]);

  // Toggle OTT selection
  const toggleOtt = (service) => {
    const found = otts.find((o) => o.service === service);
    if (found) {
      setOtts(otts.filter((o) => o.service !== service));
    } else {
      setOtts([...otts, { service, expiry: "", price: "" }]);
    }
  };

  // Set expiry date
  const setExpiry = (service, value) => {
    setOtts(
      otts.map((o) => (o.service === service ? { ...o, expiry: value } : o))
    );
  };

  // Set plan price
  const setPrice = (service, value) => {
    // Allow only positive numbers
    const numeric = value.replace(/[^0-9]/g, "");
    setOtts(
      otts.map((o) => (o.service === service ? { ...o, price: numeric } : o))
    );
  };

  // Save to backend with validation for active plans
  const save = async () => {
    if (!token) return alert("You must be logged in");

    // Check for missing fields
    for (const o of otts) {
      if (!o.expiry) {
        return alert(`Please enter expiry date for ${o.service}.`);
      }
      if (!o.price) {
        return alert(`Please enter plan price for ${o.service}.`);
      }
    }

    // Check for duplicates in current form
    const seen = new Set();
    for (const o of otts) {
      const key = `${o.service}-${o.expiry}`;
      if (seen.has(key)) {
        return alert(
          `Duplicate entry detected for ${o.service} with expiry ${o.expiry}`
        );
      }
      seen.add(key);
    }

    setLoading(true);
    try {
      // First, get existing subscriptions to check for active plans
      const existingRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/subscriptions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for comparison

      // Check each new subscription against existing ones
      for (const o of otts) {
        // Find existing subscription for same service
        const existingPlan = existingRes.data.find(
          (sub) => sub.serviceName.toLowerCase() === o.service.toLowerCase()
        );

        if (existingPlan) {
          const existingExpiry = new Date(existingPlan.expiryDate);
          existingExpiry.setHours(0, 0, 0, 0);

          // If existing plan hasn't expired yet, reject new plan
          if (existingExpiry >= today) {
            return alert(
              `You already have an active ${
                o.service
              } plan until ${existingExpiry.toLocaleDateString()}. Wait until it expires before adding a new plan.`
            );
          }
        }
      }

      // If validation passed, save each subscription
      for (const o of otts) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/subscriptions`,
          {
            serviceName: o.service,
            expiryDate: o.expiry,
            plan: `₹${o.price}`,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      alert("Subscriptions saved successfully!");
      // Clear the form after successful save
      setOtts([]);
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is not logged in
  if (!token) {
    return (
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          Please log in to manage subscriptions
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
      <h2 className="text-xl font-bold mb-4">Add New OTT Subscriptions</h2>
      <p className="text-sm text-gray-600 mb-4">
        Select services, set expiry dates, and enter plan prices. All
        subscriptions are saved permanently.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {ALL_OTTS.map((s) => {
          const sel = otts.find((o) => o.service === s);
          return (
            <div key={s} className="flex flex-col gap-2 border p-3 rounded">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!sel}
                  onChange={() => toggleOtt(s)}
                />
                <span className="font-medium">{s}</span>
              </label>
              {sel && (
                <>
                  <input
                    type="date"
                    value={sel.expiry || ""}
                    onChange={(e) => setExpiry(s, e.target.value)}
                    className="p-1 border rounded text-sm"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Plan Price (₹)"
                    value={sel.price || ""}
                    onChange={(e) => setPrice(s, e.target.value)}
                    className="p-1 border rounded text-sm"
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => setOtts([])}
          className="px-4 py-2 border rounded"
        >
          Clear Form
        </button>
      </div>
    </div>
  );
}
