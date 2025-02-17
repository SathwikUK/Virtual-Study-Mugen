import { useState } from "react";
import axios from "../api/axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await axios.post("/auth/reset-password", {
        email,
        token,
        newPassword,
      });
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Reset password failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-full max-w-md border border-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-purple-700 opacity-10 blur-3xl"></div>
        <h2 className="text-3xl font-bold text-purple-400 mb-4 text-center drop-shadow-lg">
          Reset Password
        </h2>
        {message && (
          <div className="mb-4 text-center text-green-400">{message}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 bg-gray-800 text-white border border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-md shadow-purple-500"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 bg-gray-800 text-white border border-purple-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none shadow-md shadow-purple-500"
          />
          {passwordError && (
            <div className="text-red-400 text-sm">{passwordError}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-700 to-purple-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500 transition-transform transform hover:scale-105"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
