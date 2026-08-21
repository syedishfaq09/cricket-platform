import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [player, setPlayer] = useState(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);

  const [myMatches, setMyMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  useEffect(() => {
    if (!user?.player) {
      return;
    }

    // ==========================================
    // FETCH PLAYER PROFILE
    // ==========================================

    setLoadingPlayer(true);

    fetch(`http://localhost:5000/api/players/${user.player}`)
      .then((response) => response.json())
      .then((data) => {
        setPlayer(data);
      })
      .catch((error) => {
        console.error("Error fetching player:", error);
      })
      .finally(() => {
        setLoadingPlayer(false);
      });

    // ==========================================
    // FETCH PLAYER'S COMPLETED MATCHES
    // ==========================================

    setLoadingMatches(true);

    fetch(`http://localhost:5000/api/matches/player/${user.player}/completed`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch player matches");
        }

        return response.json();
      })
      .then((data) => {
        setMyMatches(data);
      })
      .catch((error) => {
        console.error("Error fetching player matches:", error);
      })
      .finally(() => {
        setLoadingMatches(false);
      });
  }, []);

  const formatMatchDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };
  const handleLogout = () => {
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("userLoginStateChanged"));

    navigate("/login");
  };
  if (!user) {
    return (
      <main className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2>Please login first.</h2>

          <button
            className="btn mt-3"
            style={{
              backgroundColor: "#d4af37",
              color: "#171717",
            }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  const isAdmin = user.role === "admin";
  const isPlayer = !!user.player;

  return (
    <main className="min-vh-100 py-5">
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ color: "#d4af37" }}>
            ⭐ ALAMDAR STARS
          </h1>

          <h2 className="mt-4">Welcome, {user.name}!</h2>

          <p className="text-secondary">
            {isAdmin
              ? isPlayer
                ? "Admin & Player Account"
                : "Admin Dashboard"
              : "Player Dashboard"}
          </p>
        </div>

        {/* ADMIN SECTION */}
        {isAdmin && (
          <div className="row g-4 mb-4">
            <div className="col-12">
              <div
                className="card text-center p-4"
                style={{
                  border: "2px solid #d4af37",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/admin")}
              >
                <h3>🛠️ Admin Dashboard</h3>

                <p className="text-secondary mb-3">
                  Manage players, matches, posts and team information.
                </p>

                <button
                  className="btn"
                  style={{
                    backgroundColor: "#d4af37",
                    color: "#171717",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/admin");
                  }}
                >
                  Open Admin Dashboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PLAYER SECTION */}
        {isPlayer && (
          <>
            <div className="text-center mb-4">
              <h3>🏏 Player Area</h3>

              {isAdmin && (
                <p className="text-secondary">
                  You are also registered as a team player.
                </p>
              )}
            </div>

            <div className="row g-4">
              {/* MY PROFILE */}
              <div className="col-md-4">
                <div
                  className="card text-center p-4 h-100"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/profile")}
                >
                  <h3>👤 My Profile</h3>

                  {loadingPlayer ? (
                    <p className="text-secondary mt-3">Loading profile...</p>
                  ) : player ? (
                    <>
                      <h4 className="mt-3">{player.name}</h4>

                      {player.isCaptain && (
                        <div className="mb-2">
                          <span
                            className="badge rounded-pill"
                            style={{
                              backgroundColor: "#d4af37",
                              color: "#171717",
                              fontSize: "0.75rem",
                            }}
                          >
                            👑 Captain
                          </span>
                        </div>
                      )}

                      <p className="text-secondary mb-1">
                        Role: {player.role || "Not set"}
                      </p>

                      <p className="text-secondary mb-1">
                        Jersey: {player.jerseyNumber || "—"}
                      </p>

                      <p className="text-secondary">
                        {player.bio || "No bio added yet."}
                      </p>

                      <small style={{ color: "#d4af37" }}>
                        Click to edit profile
                      </small>
                    </>
                  ) : (
                    <p className="text-secondary mt-3">
                      Player profile not found.
                    </p>
                  )}
                </div>
              </div>
              {/* MY MATCHES */}
              <div className="col-md-4">
                <div
                  className="card text-center p-4 h-100"
                  style={{
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/my-matches")}
                >
                  <h3>🏏 My Matches</h3>

                  <p className="text-secondary">
                    Your completed matches and performances.
                  </p>

                  {loadingMatches ? (
                    <p className="text-secondary mt-3">Loading matches...</p>
                  ) : myMatches.length === 0 ? (
                    <p className="text-secondary mt-3">
                      You have not played in any completed matches yet.
                    </p>
                  ) : (
                    <>
                      <p className="text-secondary mt-3">
                        You have played in <strong>{myMatches.length}</strong>{" "}
                        completed {myMatches.length === 1 ? "match" : "matches"}
                        .
                      </p>

                      <button
                        className="btn mt-2"
                        style={{
                          backgroundColor: "#d4af37",
                          color: "#171717",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/my-matches");
                        }}
                      >
                        View All Matches
                      </button>
                    </>
                  )}
                </div>
              </div>
              {/* MY STATISTICS */}
              <div className="col-md-4">
                <div className="card text-center p-4 h-100">
                  <h3>📊 My Statistics</h3>

                  <p className="text-secondary">
                    View your cricket performance.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ADMIN WITHOUT PLAYER */}
        {isAdmin && !isPlayer && (
          <div className="text-center mt-4">
            <p className="text-secondary">
              This admin account is not linked to a player profile.
            </p>
          </div>
        )}

        {/* LOGOUT */}
        <div className="text-center mt-5">
          <button
            className="btn"
            style={{
              backgroundColor: "#d4af37",
              color: "#171717",
              border: "none",
            }}
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
