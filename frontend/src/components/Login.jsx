import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      const user = JSON.parse(savedUser);

      if (user.role === "player" && user.status === "approved") {
        navigate("/profile", { replace: true });
      }
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!identifier.trim()) {
      setMessage("Please enter your phone number or email.");
      return;
    }

    if (!password.trim()) {
      setMessage("Please enter your password.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));

        // Tell Navbar that login state changed
        window.dispatchEvent(new Event("userLoginStateChanged"));

        setMessage(`Welcome, ${data.user.name}!`);

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setMessage(data.message || "Unable to login.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-dark text-white min-vh-100 d-flex align-items-center justify-content-center">
      <div
        className="card bg-black text-white p-4 shadow"
        style={{
          width: "400px",
          border: "1px solid #d4af37",
        }}
      >
        <h2 className="text-center fw-bold" style={{ color: "#d4af37" }}>
          ⭐ ALAMDAR STARS
        </h2>

        <p className="text-center text-secondary">Player Login</p>

        {/* PHONE OR EMAIL */}
        <label className="mb-2">Phone Number or Email</label>

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Enter your phone number or email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />

        {/* PASSWORD */}
        <label className="mb-2">Password</label>

        <input
          type="password"
          className="form-control mb-3"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin();
            }
          }}
        />

        {/* LOGIN BUTTON */}
        <button
          className="btn w-100"
          style={{
            backgroundColor: "#d4af37",
            color: "#000",
          }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center mt-3">
          <span className="text-secondary">Not registered yet? </span>

          <button
            className="btn btn-link p-0 text-decoration-none"
            style={{ color: "#d4af37" }}
            onClick={() => navigate("/register")}
          >
            Register as Player
          </button>
        </div>
        {/* MESSAGE */}
        {message && <p className="text-center mt-3 mb-0">{message}</p>}
      </div>
    </main>
  );
}

export default Login;
