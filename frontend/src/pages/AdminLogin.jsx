import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone.trim() || !password.trim()) {
      setMessage("Please enter your phone number and password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        "http://localhost:5000/api/auth/admin-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phone.trim(),
            password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event("userLoginStateChanged"));

        setMessage("Admin login successful.");

        setTimeout(() => {
          navigate("/admin");
        }, 500);
      } else {
        setMessage(data.message || "Invalid admin credentials.");
      }
    } catch (error) {
      console.error("Admin login error:", error);

      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        backgroundColor: "#f1f3f6",
      }}
    >
      <div
        className="card p-4 shadow"
        style={{
          width: "400px",
          maxWidth: "90%",
          border: "1px solid #d4af37",
          borderRadius: "15px",
        }}
      >
        {/* HEADER */}

        <div className="text-center mb-4">
          <h2
            className="fw-bold"
            style={{
              color: "#d4af37",
            }}
          >
            ⭐ ALAMDAR STARS
          </h2>

          <h3 className="mt-3">Admin Login</h3>

          <p className="text-secondary">Authorized administrators only</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* PHONE */}

          <div className="mb-3">
            <label className="form-label fw-semibold">Phone Number</label>

            <input
              type="tel"
              className="form-control"
              placeholder="Enter admin phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}

          <div className="mb-4">
            <label className="form-label fw-semibold">Password</label>

            <input
              type="password"
              className="form-control"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* MESSAGE */}

          {message && (
            <div className="alert alert-info text-center">{message}</div>
          )}

          {/* LOGIN */}

          <button
            type="submit"
            className="btn w-100"
            style={{
              backgroundColor: "#d4af37",
              color: "#000",
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login as Admin"}
          </button>

          {/* BACK */}

          <button
            type="button"
            className="btn btn-outline-secondary w-100 mt-3"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </form>
      </div>
    </main>
  );
}

export default AdminLogin;
