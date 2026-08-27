import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// import stadiumBg from "../assets/stadium-bg.jpg";

function Home() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllPerformances, setShowAllPerformances] = useState(false);

  // ==========================================
  // FETCH MATCHES
  // ==========================================

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/matches`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }

        const data = await response.json();

        //temporarily replaced

        console.log(
          "HOME MATCHES PHOTO DATA:",
          data.map((match) => ({
            id: match._id,
            opponent: match.opponent,
            status: match.status,
            promotionalPhoto: match.promotionalPhoto,
            playerOfMatchPhoto: match.playerOfMatchPhoto,
            playerOfMatch: match.playerOfMatch,
          })),
        );

        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // ==========================================
  // CURRENT LIVE MATCH
  // ==========================================

  const currentMatch = matches.find((match) => match.status === "Live");

  // ==========================================
  // NEXT UPCOMING MATCH
  // ==========================================

  const upcomingMatches = matches
    .filter((match) => match.status === "Upcoming")
    .sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

  const nextMatch = upcomingMatches[0];

  // ==========================================
  // HOMEPAGE MATCH STORY
  // ==========================================

  // Latest upcoming match with promotional photo
  const upcomingStoryMatch = upcomingMatches.find(
    (match) => match.promotionalPhoto,
  );

  // Latest completed match for Match Completed story
  const completedMatchStory = matches
    .filter((match) => match.status === "Completed")
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateB.getTime() !== dateA.getTime()) {
        return dateB - dateA;
      }

      const timeA = a.time || "00:00";
      const timeB = b.time || "00:00";

      return timeB.localeCompare(timeA);
    })[0];

  // The match currently controlling the Match Story
  const matchStory = upcomingStoryMatch || completedMatchStory;

  const completedStoryMatches = matches
    .filter((match) => match.status === "Completed" && match.playerOfMatch)
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateB.getTime() !== dateA.getTime()) {
        return dateB - dateA;
      }

      const timeA = a.time || "00:00";
      const timeB = b.time || "00:00";

      return timeB.localeCompare(timeA);
    });

  const playerOfMatchStoryMatch = completedStoryMatches[0];

  // ==========================================
  // PLAYER OF THE MATCH STORY
  // ==========================================

  const playerOfMatchStoryPlayer = playerOfMatchStoryMatch?.playerOfMatch;

  // ==========================================
  // LATEST COMPLETED MATCH WITH PERFORMANCE
  // ==========================================

  const completedMatches = matches
    .filter(
      (match) =>
        match.status === "Completed" &&
        match.playerOfMatch &&
        Array.isArray(match.playerPerformances) &&
        match.playerPerformances.length > 0,
    )
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      // First compare match dates
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB - dateA;
      }

      // If dates are the same, compare match times
      const timeA = a.time || "00:00";
      const timeB = b.time || "00:00";

      return timeB.localeCompare(timeA);
    });

  const latestCompletedMatch = completedMatches[0];

  const playerOfMatch = latestCompletedMatch?.playerOfMatch;

  // ==========================================
  // LATEST MATCH PERFORMANCE
  // ==========================================

  const performanceMatches = matches
    .filter(
      (match) =>
        match.status === "Completed" &&
        match.playerPerformances &&
        match.playerPerformances.length > 0,
    )
    .sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });

  const latestPerformanceMatch = performanceMatches[0];

  const latestPerformances = latestPerformanceMatch?.playerPerformances || [];

  // ==========================================
  // CONVERT BALLS TO CRICKET OVERS
  // ==========================================

  const formatOvers = (balls) => {
    const totalBalls = Number(balls) || 0;

    const overs = Math.floor(totalBalls / 6);
    const remainingBalls = totalBalls % 6;

    return `${overs}.${remainingBalls}`;
  };

  // ==========================================
  // CHECK IF MATCH TIME HAS PASSED
  // ==========================================

  const hasMatchExpired = (match) => {
    if (!match?.date || !match?.time) {
      return false;
    }

    const matchDate = new Date(match.date);

    const [hours, minutes] = match.time.split(":");

    matchDate.setHours(Number(hours));
    matchDate.setMinutes(Number(minutes));
    matchDate.setSeconds(0);
    matchDate.setMilliseconds(0);

    return new Date() >= matchDate;
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // FORMAT TIME - 12 HOUR
  // ==========================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();
    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));
    date.setSeconds(0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  return (
    <main className="home-page">
      {/* ==========================================
          HERO SECTION
      ========================================== */}

      <section className="home-hero text-center">
        <div className="container py-5">
          <h1 className="home-title display-2 fw-bold">ALAMDAR STARS</h1>

          <h3 className="home-subtitle fw-bold mt-3">ONE TEAM, ONE DREAM</h3>

          <p className="home-description lead mt-3">
            Welcome to the official Alamdar Stars Mashwara cricket team website
          </p>
        </div>
      </section>

      {/* ==========================================
    MATCH STORY
========================================== */}

      {!loading && matchStory && (
        <section className="container py-5">
          <div
            className="position-relative overflow-hidden rounded-4"
            style={{
              minHeight: "420px",
              backgroundImage: matchStory.promotionalPhoto
                ? `url(${matchStory.promotionalPhoto})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "#171717",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.18)",
            }}
          >
            {/* DARK OVERLAY */}

            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85))",
              }}
            ></div>

            {/* STORY CONTENT */}

            <div
              className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5"
              style={{
                zIndex: 2,
                color: "#ffffff",
              }}
            >
              {/* STORY STATUS */}

              <div
                className="fw-bold mb-2"
                style={{
                  color: "#d4af37",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                {matchStory.status === "Upcoming"
                  ? hasMatchExpired(matchStory)
                    ? "Expired"
                    : "Upcoming Match"
                  : "Match Completed"}
              </div>

              {/* MATCH TITLE */}

              <h2
                className="fw-bold mb-3"
                style={{
                  color: "#ffffff",
                }}
              >
                Alamdar Stars
                <span
                  className="mx-2"
                  style={{
                    color: "#d4af37",
                  }}
                >
                  vs
                </span>
                {matchStory.opponent}
              </h2>

              {/* ==========================================
            COMPLETED MATCH
        ========================================== */}

              {matchStory.status === "Completed" ? (
                <>
                  {matchStory.outcome && (
                    <p
                      className="fs-4 fw-bold mb-2"
                      style={{
                        color:
                          matchStory.outcome === "Won"
                            ? "#4ade80"
                            : matchStory.outcome === "Lost"
                              ? "#f87171"
                              : "#ffffff",
                      }}
                    >
                      {matchStory.outcome}
                    </p>
                  )}

                  {(matchStory.ourScore || matchStory.opponentScore) && (
                    <p
                      className="fs-4 fw-bold mb-2"
                      style={{
                        color: "#ffffff",
                      }}
                    >
                      {matchStory.ourScore || "-"}
                      <span className="mx-2">–</span>
                      {matchStory.opponentScore || "-"}
                    </p>
                  )}

                  {matchStory.result && (
                    <p
                      className="fs-5 mb-2"
                      style={{
                        color: "#ffffff",
                      }}
                    >
                      {matchStory.result}
                    </p>
                  )}

                  <p
                    className="mb-1"
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    📅 {formatDate(matchStory.date)}
                  </p>

                  <p
                    className="mb-1"
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    📍 {matchStory.venue}
                  </p>

                  {matchStory.tournament && (
                    <p
                      className="mb-0"
                      style={{
                        color: "#ffffff",
                      }}
                    >
                      🏆 {matchStory.tournament}
                    </p>
                  )}
                </>
              ) : (
                /* ==========================================
              UPCOMING MATCH
          ========================================== */

                <>
                  <p
                    className="mb-1 fs-5"
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    📅 {formatDate(matchStory.date)}
                  </p>

                  <p
                    className="mb-1 fs-5"
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    🕐 🕐 {formatTime(matchStory.time)}
                  </p>

                  <p
                    className="mb-1 fs-5"
                    style={{
                      color: "#ffffff",
                    }}
                  >
                    📍 {matchStory.venue}
                  </p>

                  {matchStory.tournament && (
                    <p
                      className="mb-0"
                      style={{
                        color: "#ffffff",
                      }}
                    >
                      🏆 {matchStory.tournament}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
    PLAYER OF THE MATCH STORY
========================================== */}

      {!loading && playerOfMatchStoryMatch && playerOfMatchStoryPlayer && (
        <section className="container pb-5">
          <div
            className="position-relative overflow-hidden rounded-4"
            style={{
              minHeight: "420px",
              backgroundImage: `url(${
                playerOfMatchStoryMatch.playerOfMatchPhoto ||
                playerOfMatchStoryPlayer.photo
              })`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 12px 35px rgba(0, 0, 0, 0.18)",
            }}
          >
            {/* DARK OVERLAY */}

            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85))",
              }}
            ></div>

            {/* STORY CONTENT */}

            <div
              className="position-absolute bottom-0 start-0 w-100 p-4 p-md-5"
              style={{
                zIndex: 2,
                color: "#ffffff",
              }}
            >
              <div
                className="fw-bold mb-2"
                style={{
                  color: "#d4af37",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Player of the Match
              </div>

              <h2
                className="fw-bold mb-3"
                style={{
                  color: "#ffffff",
                }}
              >
                {playerOfMatchStoryPlayer.name}
              </h2>

              <div
                className="d-flex flex-wrap gap-3"
                style={{
                  color: "#ffffff",
                }}
              >
                {playerOfMatchStoryMatch.playerOfMatchRuns && (
                  <div className="fs-5">
                    🏏{" "}
                    <strong>{playerOfMatchStoryMatch.playerOfMatchRuns}</strong>{" "}
                    runs
                  </div>
                )}

                {playerOfMatchStoryMatch.playerOfMatchWickets && (
                  <div className="fs-5">
                    🎯{" "}
                    <strong>
                      {playerOfMatchStoryMatch.playerOfMatchWickets}
                    </strong>{" "}
                    wickets
                  </div>
                )}
              </div>

              {playerOfMatchStoryMatch.playerOfMatchPerformance && (
                <p
                  className="mt-3 mb-0 fs-5"
                  style={{
                    color: "#ffffff",
                  }}
                >
                  {playerOfMatchStoryMatch.playerOfMatchPerformance}
                </p>
              )}

              <div
                className="mt-3"
                style={{
                  color: "#d4af37",
                  fontWeight: "600",
                }}
              >
                Alamdar Stars vs {playerOfMatchStoryMatch.opponent}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          LATEST MATCH PERFORMANCE / STORY
      ========================================== */}

      <section className="container py-5">
        <div className="home-card p-4">
          <div className="text-center mb-4">
            <div className="display-4"></div>

            <h2 className="fw-bold mt-2">LATEST MATCH PERFORMANCE</h2>

            {latestPerformanceMatch && (
              <p className="fs-5 mb-0">
                Alamdar Stars
                <span
                  className="mx-2"
                  style={{
                    color: "#d4af37",
                  }}
                >
                  vs
                </span>
                {latestPerformanceMatch.opponent}
              </p>
            )}

            {latestPerformanceMatch && (
              <p className="text-white-50 mt-2 mb-0">
                {formatDate(latestPerformanceMatch.date)}
              </p>
            )}
          </div>
          {loading ? (
            <p className="text-center fs-5">Loading performance...</p>
          ) : latestPerformanceMatch && latestPerformances.length > 0 ? (
            <>
              <div className="row g-3">
                {(showAllPerformances
                  ? latestPerformances
                  : latestPerformances.slice(0, 2)
                ).map((performance) => (
                  <div
                    className="col-12 col-md-6"
                    key={performance.player?._id}
                  >
                    <div
                      className="p-3 rounded"
                      style={{
                        backgroundColor: "#e5e7eb",
                        border: "1px solid #d1d5db",
                        borderLeft: "4px solid #d4af37",
                        color: "#1f2937",
                        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.10)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        {performance.player?.photo ? (
                          <img
                            src={performance.player.photo}
                            alt={performance.player.name}
                            style={{
                              width: "65px",
                              height: "65px",
                              objectFit: "cover",
                              borderRadius: "50%",
                              border: "2px solid #d4af37",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "65px",
                              height: "65px",
                              borderRadius: "50%",
                              backgroundColor: "#222",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "2rem",
                            }}
                          >
                            👤
                          </div>
                        )}

                        <div className="flex-grow-1">
                          <h5 className="fw-bold mb-1 player-name">
                            {performance.player?.name || "Player"}

                            {performance.player?.jerseyNumber && (
                              <small
                                className="ms-2"
                                style={{ color: "#6b7280" }}
                              >
                                #{performance.player.jerseyNumber}
                              </small>
                            )}
                          </h5>

                          <div
                            className="fs-5 fw-bold"
                            style={{ color: "#1f2937" }}
                          >
                            {performance.runs} Runs
                            {performance.wickets > 0 && (
                              <>
                                <span className="mx-2">•</span>
                                {performance.wickets}{" "}
                                {performance.wickets === 1
                                  ? "Wicket"
                                  : "Wickets"}
                              </>
                            )}
                          </div>

                          <div className="mt-1" style={{ color: "#6b7280" }}>
                            {performance.ballsFaced || 0} Balls Faced
                          </div>

                          {(performance.ballsBowled || 0) > 0 && (
                            <div style={{ color: "#6b7280" }}>
                              {formatOvers(performance.ballsBowled)} Overs
                              Bowled
                            </div>
                          )}

                          <div style={{ color: "#6b7280" }}>
                            {performance.fours || 0} Fours
                            <span className="mx-2">•</span>
                            {performance.sixes || 0} Sixes
                            <span className="mx-2">•</span>
                            {performance.singles || 0} Singles
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* VIEW ALL BUTTON */}
              {latestPerformances.length > 2 && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn px-4"
                    style={{
                      backgroundColor: "#d4af37",
                      color: "#171717",
                      fontWeight: "600",
                    }}
                    onClick={() =>
                      setShowAllPerformances((previous) => !previous)
                    }
                  >
                    {showAllPerformances ? "Show Less" : "View All"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="fs-5 mb-2">No match performance available yet.</p>

              <p className="text-white-50">
                Player performances will appear here after the next completed
                match.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
export default Home;
