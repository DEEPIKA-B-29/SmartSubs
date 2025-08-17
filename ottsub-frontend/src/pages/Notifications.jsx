// pages/Notifications.jsx - PRODUCTION VERSION
import { useEffect, useState } from "react";
import axios from "axios";
import ReminderCard from "../components/ReminderCard";
import { useAuth } from "../context/authContext";
import { Bell, BellOff, RefreshCw, AlertCircle } from "lucide-react";

export default function Notifications() {
  // Get authentication token from context
  const { token } = useAuth();

  // State variables
  const [reminders, setReminders] = useState([]); // Array of reminder objects
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [emailEnabled, setEmailEnabled] = useState(true); // User's email preference
  const [updating, setUpdating] = useState(false); // Loading state for email toggle
  const [error, setError] = useState(null); // Error messages

  // Function to fetch both reminders and email preferences
  const fetchData = async () => {
    if (!token) return; // Don't fetch if user not logged in

    setLoading(true);
    setError(null);

    try {
      // Make 2 API calls simultaneously
      const [remindersRes, preferencesRes] = await Promise.all([
        // 1. Get reminders (subscriptions expiring in 1 or 3 days)
        axios.get(`${import.meta.env.VITE_API_URL}/api/reminders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        // 2. Get user's email notification preference
        axios.get(`${import.meta.env.VITE_API_URL}/api/users/reminder`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Process reminders response - ensure it's always an array
      const remindersData = Array.isArray(remindersRes.data)
        ? remindersRes.data
        : [];
      setReminders(remindersData);

      // Set email preference (default to true if not found)
      setEmailEnabled(preferencesRes.data?.remindersEnabled ?? true);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load notifications. Please try again.");
      setReminders([]); // Reset to empty array on error
    } finally {
      setLoading(false); // Always stop loading
    }
  };

  // Function to toggle user's email notification preference
  const toggleEmailPreference = async () => {
    if (!token) return;

    setUpdating(true); // Show loading state on button
    try {
      // Send opposite of current state to API
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/reminder`,
        { remindersEnabled: !emailEnabled }, // Toggle the current state
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state with response from server
      setEmailEnabled(response.data.remindersEnabled);
    } catch (err) {
      console.error("Failed to update email preference:", err);
      setError("Failed to update email preference. Please try again.");
    } finally {
      setUpdating(false); // Stop loading state
    }
  };

  // Run fetchData when component mounts or token changes
  useEffect(() => {
    fetchData();
  }, [token]);

  // Show login prompt if user not authenticated
  if (!token) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-lg text-red-600">
          Please login to view your notifications.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Page Header with Title and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated on your subscription renewals
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh notifications"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>

          {/* Email Toggle Button */}
          <button
            onClick={toggleEmailPreference}
            disabled={updating}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              emailEnabled
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-400 hover:bg-gray-500 text-white"
            } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {updating ? (
              <RefreshCw size={18} className="animate-spin" />
            ) : emailEnabled ? (
              <Bell size={18} />
            ) : (
              <BellOff size={18} />
            )}
            <span>{emailEnabled ? "Email ON" : "Email OFF"}</span>
          </button>
        </div>
      </div>

      {/* Email Preference Info Banner */}
      <div
        className={`mb-6 p-3 rounded-lg border ${
          emailEnabled
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-gray-50 border-gray-200 text-gray-600"
        }`}
      >
        <p className="text-sm">
          {emailEnabled
            ? "✅ You will receive email reminders 3 and 1 day before your subscriptions expire."
            : "📭 Email reminders are disabled. You can still view upcoming renewals here."}
        </p>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-600">
            <RefreshCw size={24} className="animate-spin" />
            <span>Loading your notifications...</span>
          </div>
        </div>
      )}

      {/* Main Content - Reminders List */}
      {!loading && (
        <>
          {reminders.length === 0 ? (
            // No Reminders State
            <div className="text-center py-12">
              <Bell size={48} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No upcoming reminders
              </h3>
              <p className="text-gray-500">
                Your subscriptions are all set! We'll notify you when renewals
                are due.
              </p>
            </div>
          ) : (
            // Show Reminders
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Upcoming Renewals ({reminders.length})
                </h2>
                <p className="text-sm text-gray-600">
                  Subscriptions requiring attention in the next few days
                </p>
              </div>

              {/* Render Each Reminder Card */}
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <ReminderCard key={reminder._id} reminder={reminder} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
