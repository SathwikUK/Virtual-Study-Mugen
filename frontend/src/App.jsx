import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VsmChat from "./pages/VsmChat";


function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>

        <Route path="/admin-dashboard" element={<AdminDashboard/>} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/openai" element={<VsmChat />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        
      </Routes>
    </Router>
  );
}

export default App;
