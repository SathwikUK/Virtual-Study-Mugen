// src/pages/Login.jsx
import { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import loginImage from "../assets/vsmlog.png"; // Replace with your image

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // States for forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  // New state to track success (true) or error (false)
  const [forgotSuccess, setForgotSuccess] = useState(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    else if (name === "password") setPassword(value);
    else if (name === "role") setRole(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
        role,
      });
      const { token, role: serverRole } = response.data;
      if (serverRole !== role) {
        setMessage("Invalid credentials for the selected role.");
        setLoading(false);
        return;
      }
      localStorage.setItem("token", token);
      navigate(serverRole === "admin" ? "/admin-dashboard" : "/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotMessage("Please enter your email.");
      setForgotSuccess(false);
      return;
    }
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const response = await axios.post("/auth/forgot-password", {
        email: forgotEmail,
      });
      setForgotMessage(response.data.message);
      setForgotSuccess(true);
    } catch (error) {
      setForgotMessage(
        error.response?.data?.message || "Failed to send reset link."
      );
      setForgotSuccess(false);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-1000 p-6 relative overflow-hidden">
      <button
        onClick={() => navigate("/")}
        type="button"
        className="absolute top-6 left-6 flex items-center text-blue-400 hover:text-blue-600 transition duration-300 z-30 bg-gray-800 bg-opacity-70 px-3 py-2 rounded-lg"
      >
        <FaArrowLeft className="mr-2" />
        Back to Home
      </button>

      <div className="flex flex-col md:flex-row items-center w-full max-w-5xl bg-gray-1000 rounded-xl overflow-hidden gap-10 relative z-20 shadow-lg">
        <div className="hidden md:flex md:w-1/2 p-12 items-center justify-center">
          <img
            src={loginImage}
            alt="Login Illustration"
            className="max-w-full h-auto rounded-lg shadow-lg hover:scale-105 transition duration-500 ease-in-out"
          />
        </div>

        <div className="w-full md:w-1/2 p-10 bg-gray-950 rounded-lg text-white space-y-8">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700 hover:shadow-blue-500/50 transition duration-500 ease-in-out"
          >
            <h2 className="text-4xl font-extrabold text-center mt-2 mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Login
            </h2>
            {message && (
              <div className="mb-4 text-center text-red-400 font-medium">
                {message}
              </div>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={handleChange}
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={password}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div>
              <label className="block text-gray-400 font-medium mb-2">
                Role
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={handleChange}
                    className="form-radio text-blue-500"
                  />
                  <span className="ml-2">Student</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={handleChange}
                    className="form-radio text-blue-500"
                  />
                  <span className="ml-2">Admin</span>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-400 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
          <p className="text-center text-gray-400">
            Don't have an account?{" "}
            <a
              href="/signup"
              className="text-blue-400 font-semibold hover:underline"
            >
              Sign up here
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-70"></div>
          <div
            className="bg-black rounded-lg p-6 z-10 w-80 border border-purple-700 
                       shadow-2xl shadow-[0_0_20px_2px_rgba(128,0,128,0.7)] 
                       transition-shadow duration-300"
          >
            <h3 className="text-xl font-bold text-purple-400 mb-4">
              Forgot Password
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Enter your email to receive a password reset link.
            </p>
            <input
              type="email"
              placeholder="Your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full p-2 rounded mb-2 bg-gray-700 text-white border border-purple-700
                         focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            {forgotMessage && (
              <p
                className={`text-xs mb-2 ${
                  forgotSuccess ? "text-green-400" : "text-red-400"
                }`}
              >
                {forgotMessage}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotEmail("");
                  setForgotMessage("");
                  setForgotSuccess(null);
                }}
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500 transition-colors shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotSubmit}
                disabled={forgotLoading}
                className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 transition-colors shadow-md hover:shadow-lg"
              >
                {forgotLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
