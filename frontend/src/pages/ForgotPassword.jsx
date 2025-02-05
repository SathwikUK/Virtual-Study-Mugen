import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Manage current step (1: Email, 2: OTP and Password)
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") {
      setEmail(value);
    } else if (name === "otp") {
      setOtp(value);
    } else if (name === "newPassword") {
      setNewPassword(value);
    }
  };

  // Request OTP for email
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage(response.data.message);

      if (response.data.success) {
        setStep(2); // Proceed to Step 2 (OTP and New Password)
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and reset password
  const handleVerifyOTPAndResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Step 1: Verify OTP
      const verifyResponse = await axios.post("http://localhost:5000/api/auth/verify-otp", { email, otp });

      if (verifyResponse.data.message === "OTP verified successfully") {
        // Step 2: Reset password if OTP is correct
        const resetResponse = await axios.post("http://localhost:5000/api/auth/reset-password", { email, newPassword });
        setMessage(resetResponse.data.message);
        navigate("/login"); // Redirect to login after password reset
      } else {
        setMessage("Invalid OTP.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to verify OTP or reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-1000 p-6">
      <div className="w-full max-w-md bg-gray-950 p-8 rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-white mb-6">Forgot Password</h2>

        {message && <div className="text-center text-red-400 mb-4">{message}</div>}

        {/* Step 1: Enter Email to receive OTP */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP and New Password */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTPAndResetPassword} className="space-y-4">
            <input
              type="text"
              name="otp"
              value={otp}
              onChange={handleChange}
              placeholder="Enter OTP"
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
            />
            <input
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={handleChange}
              placeholder="Enter New Password"
              required
              className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg"
              disabled={loading}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
