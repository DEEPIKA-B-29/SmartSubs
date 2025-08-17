import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 md:px-20 py-28">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold leading-tight mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Track Your <span className="text-red-500">OTT Subscriptions</span>
          <br /> Never Miss a Show!
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-300 max-w-2xl mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Manage your subscriptions, get renewal reminders, and find where your
          favorite movies are streaming — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex gap-4"
        >
          <Link
            to="/profile"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold text-lg transition-all"
          >
            Get Started
          </Link>
          <Link
            to="/dashboard"
            className="border border-gray-400 hover:border-white px-6 py-3 rounded-full font-semibold text-lg transition-all"
          >
            Go to Dashboard
          </Link>
        </motion.div>
      </section>

      {/* Feature Section */}
      <section className="px-6 md:px-20 py-20 grid md:grid-cols-3 gap-12">
        {[
          {
            title: "Track Subscriptions",
            desc: "Save all your OTT plans with expiry dates and never miss a renewal.",
            icon: "📅",
          },
          {
            title: "Find Movies",
            desc: "Search for a movie and see if it's available on your OTT services.",
            icon: "🎬",
          },
          {
            title: "Get Reminders",
            desc: "Receive email alerts before your subscription ends.",
            icon: "🔔",
          },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
