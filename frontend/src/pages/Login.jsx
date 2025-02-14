import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import loginImage from "../assets/vsmlog.png"; // Replace with your actual image

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // Default role is 'student'
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "password") {
      setPassword(value);
    } else if (name === "role") {
      setRole(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
        role,
      });

      const token = response.data.token;
      localStorage.setItem("token", token);
      const userRole = response.data.role;

      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "student") {
        navigate("/dashboard");
      } else {
        setMessage("Invalid role.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Parent container: relative & overflow-hidden for glowing backgrounds
    <div className="min-h-screen flex items-center justify-center bg-gray-1000 p-6 relative overflow-hidden">
      {/* Glowing background blobs */}
      <div className="absolute top-[-15%] left-[-15%] w-[400px] h-[400px] bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-[30%] right-[50%] w-[200px] h-[200px] bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full blur-3xl opacity-30 animate-ping" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[400px] h-[400px] bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur-3xl opacity-30 animate-pulse" />

      {/* Main Content Container (above the glows) */}
      <button
        onClick={() => navigate("/")}
        type="button"
        className="absolute top-6 left-6 flex items-center text-blue-400 hover:text-blue-600 transition duration-300 z-10"
      >
        <FaArrowLeft className="mr-2" />
        Back to Home
      </button>

      <div className="flex flex-col md:flex-row items-center w-full max-w-5xl bg-gray-1000 rounded-xl overflow-hidden gap-10 relative z-10">
        {/* Left Div - Image */}
        <div className="md:w-1/2 p-12 flex items-center justify-center">
          <img
            src={loginImage}
            alt="Login Illustration"
            className="max-w-full h-auto rounded-lg shadow-lg hover:scale-105 transition duration-500 ease-in-out"
          />
        </div>

        {/* Right Div - Form */}
        <div className="md:w-1/2 p-10 bg-gray-950 rounded-lg ml-30 text-white space-y-8">
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

            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={handleChange}
                required
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-400"
              />
            </div>

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
    </div>
  );
};

export default Login;
