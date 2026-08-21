import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Navbar() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateUser = () => {
      const savedUser = localStorage.getItem("user");
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("storage", updateUser);
    window.addEventListener("userLoginStateChanged", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
      window.removeEventListener("userLoginStateChanged", updateUser);
    };
  }, []);

  const isPlayer = user?.role === "player" && user?.status === "approved";
  const isAdmin = user?.role === "admin";

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav
      className="navbar"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #d4af37",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="container py-2">
        {/* BRAND + MOBILE MENU BUTTON */}
        <div className="navbar-header">
          <Link
            className="navbar-brand fw-bold text-decoration-none"
            to="/"
            onClick={closeMenu}
          >
            <span className="navbar-star">⭐</span>
            ALAMDAR STARS MASHWARA
          </Link>

          {/* MOBILE HAMBURGER */}
          <button
            type="button"
            className={`navbar-menu-button ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* NAVIGATION */}
        <div className={`navbar-navigation ${menuOpen ? "show" : ""}`}>
          {/* ADMIN LOGIN */}
          {isAdmin ? (
            <Link className="navbar-link" to="/admin" onClick={closeMenu}>
              Admin Dashboard
            </Link>
          ) : (
            <Link className="navbar-link" to="/admin-login" onClick={closeMenu}>
              Admin Login
            </Link>
          )}

          {/* PLAYER LOGIN / MY PROFILE */}
          {isPlayer ? (
            <Link className="navbar-link" to="/profile" onClick={closeMenu}>
              My Profile
            </Link>
          ) : (
            <Link className="navbar-link" to="/login" onClick={closeMenu}>
              Player Login
            </Link>
          )}

          {/* COMMON LINKS */}
          <Link className="navbar-link" to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link className="navbar-link" to="/players" onClick={closeMenu}>
            Players
          </Link>

          <Link className="navbar-link" to="/matches" onClick={closeMenu}>
            Matches
          </Link>

          <Link className="navbar-link" to="/posts" onClick={closeMenu}>
            Posts
          </Link>

          <Link className="navbar-link" to="/announcements" onClick={closeMenu}>
            Announcements
          </Link>
        </div>
      </div>

      <style>
        {`
          /* ==========================================
             NAVBAR
          ========================================== */

          .navbar .container {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .navbar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .navbar-brand {
            color: #1f2937 !important;
            font-size: 1.45rem;
            font-weight: 700;
            letter-spacing: 0.3px;
            text-decoration: none;
            transition: opacity 0.2s ease;
          }

          .navbar-brand:hover {
            opacity: 0.85;
          }

          .navbar-star {
            color: #d4af37;
            margin-right: 8px;
          }

          /* ==========================================
             DESKTOP NAVIGATION
          ========================================== */

          .navbar-navigation {
            display: flex;
            align-items: center;
            gap: 28px;
          }

          .navbar-link {
            color: #1f2937 !important;
            font-weight: 500;
            text-decoration: none;
            white-space: nowrap;
            transition: color 0.2s ease;
          }

          .navbar-link:hover {
            color: #d4af37 !important;
          }

          /* ==========================================
             MOBILE MENU BUTTON
          ========================================== */

          .navbar-menu-button {
            display: none;
            width: 46px;
            height: 42px;
            border: 1px solid #d5d5d5;
            border-radius: 8px;
            background: #ffffff;
            padding: 8px;
            cursor: pointer;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
          }

          .navbar-menu-button span {
            display: block;
            width: 24px;
            height: 2px;
            background: #1f2937;
            border-radius: 2px;
            transition: 0.25s ease;
          }

          .navbar-menu-button:hover {
            border-color: #d4af37;
          }

          /* ==========================================
             MOBILE
          ========================================== */

          @media (max-width: 991px) {

            .navbar .container {
              flex-direction: column;
              align-items: stretch;
            }

            .navbar-header {
              width: 100%;
            }

            .navbar-brand {
              font-size: 1.3rem;
            }

            .navbar-menu-button {
              display: flex;
            }

            .navbar-navigation {
              display: none;
              width: 100%;
              flex-direction: column;
              align-items: stretch;
              gap: 0;
              padding-top: 12px;
              border-top: 1px solid #eeeeee;
              margin-top: 12px;
            }

            .navbar-navigation.show {
              display: flex;
            }

            .navbar-link {
              display: block;
              width: 100%;
              padding: 13px 8px;
              text-align: center;
              border-bottom: 1px solid #eeeeee;
              font-size: 1rem;
            }

            .navbar-link:last-child {
              border-bottom: none;
            }
          }

          /* ==========================================
             SMALL PHONES
          ========================================== */

          @media (max-width: 480px) {

            .navbar .container {
              padding-left: 16px;
              padding-right: 16px;
            }

            .navbar-brand {
              font-size: 1.15rem;
            }

            .navbar-star {
              margin-right: 5px;
            }

            .navbar-menu-button {
              width: 44px;
              height: 40px;
            }
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;
