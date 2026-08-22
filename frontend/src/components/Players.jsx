import { useEffect, useState } from "react";

function Players() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/players`)
      .then((response) => response.json())
      .then((data) => setPlayers(data))
      .catch((error) => console.error("Error fetching players:", error));
  }, []);

  return (
    <main className="bg-dark text-white min-vh-100 py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="fw-bold">ALAMDAR STARS</h1>
          <p className="lead">Our Players</p>
        </div>

        {/* PLAYERS LIST — compact mobile-first rows */}
        <div className="players-list">
          {players.map((player) => (
            <div className="player-row-card" key={player._id}>
              {/* PHOTO */}
              <div className="player-row-photo-wrap">
                {player.photo ? (
                  <img src={player.photo} alt={player.name} />
                ) : (
                  <span className="player-row-photo-fallback">👤</span>
                )}
              </div>

              {/* NAME + ROLE */}
              <div className="player-row-info">
                <div className="player-row-name-line">
                  <span className="player-row-name" title={player.name}>
                    {player.name}
                  </span>

                  {player.isCaptain && (
                    <span className="player-row-crown" title="Captain">
                      👑
                    </span>
                  )}
                </div>

                {player.role && (
                  <span className="player-row-role">{player.role}</span>
                )}
              </div>

              {/* ABOUT BUTTON */}
              <button
                type="button"
                className="player-row-about-btn"
                onClick={() => setSelectedPlayer(player)}
                aria-label={`About ${player.name}`}
              >
                About
              </button>
            </div>
          ))}
        </div>

        {/* ABOUT MODAL — unchanged behavior, still fed by real player data */}
        {selectedPlayer && (
          <div
            className="modal d-block"
            tabIndex="-1"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.75)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-white text-dark">
                <div className="modal-header">
                  <h4 className="modal-title">
                    {selectedPlayer.name}
                    {selectedPlayer.isCaptain && " 👑"}
                  </h4>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setSelectedPlayer(null)}
                  ></button>
                </div>

                <div className="modal-body">
                  <div className="text-center mb-4">
                    {selectedPlayer.photo ? (
                      <img
                        src={selectedPlayer.photo}
                        alt={selectedPlayer.name}
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "3px solid #d4af37",
                        }}
                      />
                    ) : (
                      <div className="display-4">👤</div>
                    )}

                    <h5 className="mt-3">{selectedPlayer.role || "Player"}</h5>

                    {/* OPTIONAL META — only rendered when the field already exists in the data */}
                    {(selectedPlayer.jerseyNumber ||
                      selectedPlayer.battingStyle ||
                      selectedPlayer.bowlingStyle) && (
                      <p className="text-secondary mb-0">
                        {[
                          selectedPlayer.jerseyNumber &&
                            `#${selectedPlayer.jerseyNumber}`,
                          selectedPlayer.battingStyle,
                          selectedPlayer.bowlingStyle,
                        ]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    )}
                  </div>

                  {/* STATISTICS */}
                  <div className="row text-center g-3">
                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h5>{selectedPlayer.matchesPlayed ?? 0}</h5>
                        <small className="text-secondary">Matches Played</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div
                        className="border rounded p-3"
                        style={{
                          borderColor: "#d4af37",
                        }}
                      >
                        <h5>{selectedPlayer.totalRuns ?? 0}</h5>
                        <small className="text-secondary">Total Runs</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h5>{selectedPlayer.strikeRate ?? 0}</h5>
                        <small className="text-secondary">Strike Rate</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h5>{selectedPlayer.bestScore ?? 0}</h5>
                        <small className="text-secondary">Best Score</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h5>{selectedPlayer.ballsFaced ?? 0}</h5>
                        <small className="text-secondary">Balls Faced</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h5>{selectedPlayer.sixes ?? 0}</h5>
                        <small className="text-secondary">Sixes</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h5>{selectedPlayer.fours ?? 0}</h5>
                        <small className="text-secondary">Fours</small>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="border rounded p-3">
                        <h5>{selectedPlayer.singles ?? 0}</h5>
                        <small className="text-secondary">Singles</small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn"
                    style={{
                      backgroundColor: "#d4af37",
                      color: "#000",
                    }}
                    onClick={() => setSelectedPlayer(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Players;
