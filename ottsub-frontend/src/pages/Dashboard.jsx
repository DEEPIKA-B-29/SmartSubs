import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Trash2 } from "lucide-react";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [otts, setOtts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!token) {
        setOtts([]);
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://localhost:5000/api/subscriptions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOtts(res.data || []);
      } catch (err) {
        console.error("Failed to load subscriptions:", err);
        setOtts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, user]);

  // Helper function to get days remaining
  const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ✅ Delete handler
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this subscription?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/subscriptions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOtts((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Failed to delete subscription:", err);
      alert("Delete failed. Try again.");
    }
  };

  const upcoming = otts
    .filter((o) => o.expiryDate)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
    .slice(0, 5);

  if (!token) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Please log in to view dashboard
          </h2>
          <p className="text-gray-600">
            Access your subscription management dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your OTT subscriptions</p>
        </div>
        <Link
          to="/profile"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
        >
          + Add Subscription
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All Subscriptions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">
            Your Subscriptions
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 mt-3">
                Loading your subscriptions...
              </p>
            </div>
          ) : otts.length ? (
            <div className="space-y-4">
              {otts.map((o) => {
                const daysLeft = getDaysRemaining(o.expiryDate);
                return (
                  <div
                    key={o._id}
                    className="border border-gray-200 p-4 rounded-lg hover:shadow-md transition-shadow bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      {/* subscription info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900">
                            {o.serviceName}
                          </h4>
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              daysLeft < 0
                                ? "bg-red-100 text-red-700"
                                : daysLeft <= 7
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {daysLeft < 0
                              ? `Expired ${Math.abs(daysLeft)} days ago`
                              : `${daysLeft} days left`}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            <span className="font-medium">Plan:</span>
                            <span>{o.plan || "Not specified"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                            <span className="font-medium">Expires:</span>
                            <span>
                              {new Date(o.expiryDate).toLocaleDateString(
                                "en-IN"
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* delete button */}
                      <button
                        onClick={() => handleDelete(o._id)}
                        className="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full"
                        title="Delete Subscription"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-300 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No subscriptions yet
              </h4>
              <p className="text-gray-500 mb-4">
                Start tracking your OTT subscriptions
              </p>
              <Link
                to="/profile"
                className="text-blue-500 hover:text-blue-600 underline font-medium"
              >
                Add your first subscription
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {otts.length}
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
            Total Subscriptions
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {otts.filter((o) => getDaysRemaining(o.expiryDate) > 7).length}
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
            Active Plans
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {
              otts.filter((o) => {
                const days = getDaysRemaining(o.expiryDate);
                return days >= 0 && days <= 7;
              }).length
            }
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
            Expiring Soon
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center hover:shadow-md transition-shadow">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {otts.filter((o) => getDaysRemaining(o.expiryDate) < 0).length}
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">
            Expired Plans
          </div>
        </div>
      </div>
    </div>
  );
}
