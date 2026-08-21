import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MyMatches() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMyMatches = async () => {
      if (!user?.player) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/matches");

        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }

        const data = await response.json();

        // Only completed matches
        const completedMatches = data.filter(
          (match) =>
            match.status === "Completed" &&
            match.playerPerformances?.some(
              (performance) =>
                (performance.player?._id || performance.player) === user.player,
            ),
        );

        // Latest matches first
        completedMatches.sort((a, b) => new Date(b.date) - new Date(a.date));

        setMatches(completedMatches);
      } catch (error) {
        console.error("Error fetching my matches:", error);

        setMessage("Unable to load your matches.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyMatches();
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getOutcomeText = (outcome) => {
    if (outcome === "Won") {
      return "🏆 WON";
    }

    if (outcome === "Lost") {
      return "❌ LOST";
    }

    if (outcome === "Draw") {
      return "🤝 DRAW";
    }

    return "⚪ NO RESULT";
  };

  const getOutcomeClass = (outcome) => {
    if (outcome === "Won") {
      return "text-success";
    }

    if (outcome === "Lost") {
      return "text-danger";
    }

    if (outcome === "Draw") {
      return "text-warning";
    }

    return "text-secondary";
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

  if (!user.player) {
    return (
      <main className="min-vh-100 py-5">
        <div className="container text-center">
          <h2>Player profile not found.</h2>

          <button
            className="btn mt-3"
            style={{
              backgroundColor: "#d4af37",
              color: "#171717",
            }}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-vh-100 py-5">
        <div className="container text-center">
          <h2>Loading your matches...</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="min-vh-100 py-5">
      <div className="container">
        {/* HEADER */}

        <div className="text-center mb-5">
          <h1
            className="fw-bold"
            style={{
              color: "#d4af37",
            }}
          >
            🏏 My Matches
          </h1>

          <p className="text-secondary">
            Your completed matches and performances.
          </p>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="alert alert-info text-center">{message}</div>
        )}

        {/* NO MATCHES */}

        {matches.length === 0 ? (
          <div className="card text-center p-5">
            <div
              style={{
                fontSize: "4rem",
              }}
            >
              🏏
            </div>

            <h3 className="mt-3">No Completed Matches Yet</h3>

            <p className="text-secondary">
              Your completed matches and performances will appear here.
            </p>

            <div>
              <button
                className="btn mt-3"
                style={{
                  backgroundColor: "#d4af37",
                  color: "#171717",
                }}
                onClick={() => navigate("/dashboard")}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* MATCHES */}

            <div className="row g-4">
              {matches.map((match) => {
                const performance = match.playerPerformances?.find(
                  (item) => (item.player?._id || item.player) === user.player,
                );

                return (
                  <div className="col-md-6 col-lg-4" key={match._id}>
                    <div className="card h-100 p-4">
                      {/* TEAMS */}

                      <div className="text-center">
                        <div
                          style={{
                            fontSize: "2.5rem",
                          }}
                        >
                          🏏
                        </div>

                        <h4 className="fw-bold mt-2">Alamdar Stars</h4>

                        <div
                          className="fw-bold"
                          style={{
                            color: "#d4af37",
                          }}
                        >
                          vs
                        </div>

                        <h4 className="fw-bold">{match.opponent}</h4>
                      </div>

                      {/* DATE */}

                      <div className="text-center mt-3">
                        <div className="text-secondary">
                          📅 {formatDate(match.date)}
                        </div>
                      </div>

                      {/* OUTCOME */}

                      <div className="text-center mt-3">
                        <h5
                          className={`fw-bold ${getOutcomeClass(
                            match.outcome,
                          )}`}
                        >
                          {getOutcomeText(match.outcome)}
                        </h5>
                      </div>

                      {/* TEAM RESULT */}

                      {(match.ourScore || match.opponentScore) && (
                        <div
                          className="text-center mt-3 p-3"
                          style={{
                            backgroundColor: "#f1f2f4",
                            borderRadius: "10px",
                          }}
                        >
                          <strong>Match Score</strong>

                          <div className="mt-1">
                            {match.ourScore || "—"}
                            <span
                              className="mx-2"
                              style={{
                                color: "#d4af37",
                              }}
                            >
                              -
                            </span>
                            {match.opponentScore || "—"}
                          </div>
                        </div>
                      )}

                      {/* PLAYER PERFORMANCE */}

                      {performance && (
                        <div
                          className="mt-3 p-3"
                          style={{
                            backgroundColor: "#fffaf0",
                            borderRadius: "10px",
                            border: "1px solid #d4af37",
                          }}
                        >
                          <div className="text-center">
                            <strong>Your Performance</strong>
                          </div>

                          <div className="text-center mt-2">
                            <h5 className="fw-bold mb-1">
                              {performance.runs || 0} Runs
                              {" • "}
                              {performance.wickets || 0} Wickets
                            </h5>

                            <small className="text-secondary">
                              {performance.ballsFaced || 0} Balls
                              {" • "}
                              {performance.fours || 0} Fours
                              {" • "}
                              {performance.sixes || 0} Sixes
                            </small>
                          </div>
                        </div>
                      )}

                      {/* RESULT */}

                      {match.result && (
                        <p className="text-center text-secondary mt-3 mb-0">
                          {match.result}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BACK */}

            <div className="text-center mt-5">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/dashboard")}
              >
                ← Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default MyMatches;
