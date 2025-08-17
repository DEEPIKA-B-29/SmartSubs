import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Eye, EyeOff } from "lucide-react"; // 👁️ icons

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state
  const navigate = useNavigate();
  const { login, setLoading } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading?.(true);
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        form,
        { headers: { "Content-Type": "application/json" } }
      );

      login(res.data.token, res.data.user);
      navigate("/profile");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading?.(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded shadow"
      >
        <h2 className="text-2xl font-bold mb-4">Sign up</h2>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full p-2 border rounded mb-3"
          required
        />

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          required
        />

        {/* Password input with eye toggle */}
        <div className="relative mb-4">
          <input
            name="password"
            type={showPassword ? "text" : "password"} // 👈 toggle type
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 border rounded pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button className="w-full bg-green-600 text-white py-2 rounded">
          Create account
        </button>
      </form>
    </div>
  );
}
