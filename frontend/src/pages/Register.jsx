import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          role: "player",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Registration successful. Your account is waiting for admin approval.",
        );

        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message || "Registration failed.");
      }
    } catch (error) {
      console.error(error);
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
        padding: "40px 20px",
      }}
    >
      <div
        className="card p-4 shadow"
        style={{
          width: "420px",
          border: "1px solid #d4af37",
          borderRadius: "14px",
        }}
      >
        <h2 className="text-center fw-bold" style={{ color: "#d4af37" }}>
          ⭐ ALAMDAR STARS
        </h2>

        <h3 className="text-center mt-3">Player Registration</h3>

        <p className="text-center text-secondary">
          Register to join Alamdar Stars
        </p>

        <form onSubmit={handleRegister}>
          <label className="mb-2">Full Name</label>

          <input
            type="text"
            className="form-control mb-3"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="mb-2">Email</label>

          <input
            type="email"
            className="form-control mb-3"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="mb-2">Phone Number</label>

          <input
            type="tel"
            className="form-control mb-3"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <label className="mb-2">Password</label>

          <input
            type={showPassword ? "text" : "password"}
            className="form-control mb-2"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />

            <label className="form-check-label" htmlFor="showPassword">
              Show Password
            </label>
          </div>
          <label className="mb-2">Confirm Password</label>

          <input
            type={showConfirmPassword ? "text" : "password"}
            className="form-control mb-2"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="showConfirmPassword"
              checked={showConfirmPassword}
              onChange={(e) => setShowConfirmPassword(e.target.checked)}
            />

            <label className="form-check-label" htmlFor="showConfirmPassword">
              Show Password
            </label>
          </div>

          {message && (
            <div className="alert alert-info text-center">{message}</div>
          )}

          <button
            type="submit"
            className="btn w-100"
            style={{
              backgroundColor: "#d4af37",
              color: "#000",
            }}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register as Player"}
          </button>
        </form>

        <button
          className="btn btn-outline-secondary w-100 mt-3"
          onClick={() => navigate("/login")}
        >
          Already registered? Player Login
        </button>
      </div>
    </main>
  );
}

export default Register;
