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

        <div className="row g-4">
          {players.map((player) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={player._id}>
              <div className="card bg-black text-white h-100 text-center border-secondary">
                <div className="card-body">
                  {/* PHOTO */}
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.name}
                      className="mb-3"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "3px solid #d4af37",
                      }}
                    />
                  ) : (
                    <div className="display-4 mb-3">👤</div>
                  )}

                  {/* NAME */}
                  <h4>
                    {player.name}

                    {player.isCaptain && (
                      <span
                        className="badge ms-2"
                        style={{
                          backgroundColor: "#d4af37",
                          color: "#000",
                          fontSize: "0.7rem",
                          padding: "5px 7px",
                          borderRadius: "50%",
                        }}
                        title="Captain"
                      >
                        👑
                      </span>
                    )}
                  </h4>

                  {/* ROLE */}
                  <p className="text-secondary">
                    Role: {player.role || "Not specified"}
                  </p>

                  <hr />

                  {/* BASIC STATS */}
                  <p className="mb-1">Best Score: {player.bestScore ?? 0}</p>

                  <p className="mb-1">Runs: {player.totalRuns ?? 0}</p>

                  <p className="mb-3">Strike Rate: {player.strikeRate ?? 0}</p>

                  {/* ABOUT BUTTON */}
                  <button
                    className="btn w-100"
                    style={{
                      backgroundColor: "#d4af37",
                      color: "#000",
                    }}
                    onClick={() => setSelectedPlayer(player)}
                  >
                    About
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ABOUT MODAL */}
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
