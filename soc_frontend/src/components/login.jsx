import React, { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ email, password });

      // Store token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user)); // store full user info
      localStorage.setItem("role", data.user.role.toLowerCase().trim());

      alert("Login Successful!");

      // Role-based routing
      const role = data.user.role.toLowerCase().trim();
      if (role === "admin") {
        navigate("/dashboard"); // updated route for admin dashboard
      } else if (role === "analyst") {
        navigate("/analyst-dashboard"); // updated route for analyst dashboard
      } else {
        alert("Unknown role. Contact system admin.");
      }
      
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
      console.log(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">🛡️</div>
        <h1 className="login-title">MicroSOC</h1>
        <p className="login-subtitle">Command Center Access</p>

        <form className="login-form" onSubmit={handleLogin}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="admin@microsoc.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Sign In</button>
        </form>

        <p className="login-footer">Secure Access: Authorized Users Only</p>
      </div>
    </div>
  );
};

export default Login;
