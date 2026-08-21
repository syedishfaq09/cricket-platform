import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [players, setPlayers] = useState([]);
  const [pendingPlayers, setPendingPlayers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pendingLoading, setPendingLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [processingPlayer, setProcessingPlayer] = useState(null);

  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const [playerForm, setPlayerForm] = useState({
    name: "",
    jerseyNumber: "",
    role: "",
    battingStyle: "",
    bowlingStyle: "",
    bio: "",
  });

  const [savingPlayer, setSavingPlayer] = useState(false);

  const [showStatsForm, setShowStatsForm] = useState(false);
  const [editingStatsPlayer, setEditingStatsPlayer] = useState(null);
  const [savingStats, setSavingStats] = useState(false);

  const [statsForm, setStatsForm] = useState({
    matchesPlayed: 0,
    totalRuns: 0,
    strikeRate: 0,
    bestScore: 0,
    ballsFaced: 0,
    sixes: 0,
    fours: 0,
    singles: 0,
  });

  // ==========================================
  // ADMIN ACCESS CHECK
  // ==========================================
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchPlayers();
    fetchPendingPlayers();
  }, []);

  // ==========================================
  // GET ALL APPROVED PLAYERS
  // ==========================================
  const fetchPlayers = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/players");

      const data = await response.json();

      if (response.ok) {
        setPlayers(data);
      } else {
        setMessage(data.message || "Unable to load players.");
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GET PENDING PLAYER REGISTRATIONS
  // ==========================================
  const fetchPendingPlayers = async () => {
    if (!user?._id) {
      return;
    }

    try {
      setPendingLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/admin/pending-players",
        {
          method: "GET",
          headers: {
            "x-user-id": user._id,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setPendingPlayers(data);
      } else {
        setMessage(data.message || "Unable to load pending registrations.");
      }
    } catch (error) {
      console.error("Error fetching pending players:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setPendingLoading(false);
    }
  };

  // ==========================================
  // APPROVE PLAYER
  // ==========================================
  const approvePlayer = async (playerId) => {
    if (!user?._id) {
      setMessage("Admin account information not found.");
      return;
    }

    try {
      setProcessingPlayer(playerId);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/admin/players/${playerId}/approve`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user._id,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Player approved successfully.");

        // Remove player from pending list
        fetchPendingPlayers();

        // Player profile has now been created
        fetchPlayers();
      } else {
        setMessage(data.message || "Failed to approve player.");
      }
    } catch (error) {
      console.error("Error approving player:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setProcessingPlayer(null);
    }
  };

  // ==========================================
  // REJECT PLAYER
  // ==========================================
  const rejectPlayer = async (playerId) => {
    if (!user?._id) {
      setMessage("Admin account information not found.");
      return;
    }

    const confirmReject = window.confirm(
      "Are you sure you want to reject this player registration?",
    );

    if (!confirmReject) {
      return;
    }

    try {
      setProcessingPlayer(playerId);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/admin/players/${playerId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user._id,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Player registration rejected successfully.");

        fetchPendingPlayers();
      } else {
        setMessage(data.message || "Failed to reject player.");
      }
    } catch (error) {
      console.error("Error rejecting player:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setProcessingPlayer(null);
    }
  };

  // ==========================================
  // ASSIGN CAPTAIN
  // ==========================================
  const assignCaptain = async (playerId) => {
    if (!user?._id) {
      setMessage("Admin account information not found.");
      return;
    }

    try {
      setAssigning(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/admin/players/${playerId}/captain`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user._id,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Captain assigned successfully.");

        fetchPlayers();
      } else {
        setMessage(data.message || "Failed to assign captain.");
      }
    } catch (error) {
      console.error("Error assigning captain:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setAssigning(false);
    }
  };

  // ==========================================
  // RESET PLAYER FORM
  // ==========================================
  const resetPlayerForm = () => {
    setPlayerForm({
      name: "",
      jerseyNumber: "",
      role: "",
      battingStyle: "",
      bowlingStyle: "",
      bio: "",
    });

    setEditingPlayer(null);
  };

  // ==========================================
  // OPEN ADD PLAYER FORM
  // ==========================================
  const openAddPlayerForm = () => {
    resetPlayerForm();
    setShowPlayerForm(true);
  };

  // ==========================================
  // OPEN EDIT PLAYER FORM
  // ==========================================
  const openEditPlayerForm = (player) => {
    setEditingPlayer(player);

    setPlayerForm({
      name: player.name || "",
      jerseyNumber: player.jerseyNumber || "",
      role: player.role || "",
      battingStyle: player.battingStyle || "",
      bowlingStyle: player.bowlingStyle || "",
      bio: player.bio || "",
    });

    setShowPlayerForm(true);
  };

  // ==========================================
  // HANDLE PLAYER FORM INPUT
  // ==========================================
  const handlePlayerFormChange = (e) => {
    const { name, value } = e.target;

    setPlayerForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // ADD / EDIT PLAYER
  // ==========================================
  const savePlayer = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      setMessage("Admin account information not found.");
      return;
    }

    if (!playerForm.name.trim()) {
      setMessage("Player name is required.");
      return;
    }

    try {
      setSavingPlayer(true);
      setMessage("");

      const url = editingPlayer
        ? `http://localhost:5000/api/admin/players/${editingPlayer._id}`
        : "http://localhost:5000/api/admin/players";

      const response = await fetch(url, {
        method: editingPlayer ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user._id,
        },
        body: JSON.stringify({
          name: playerForm.name.trim(),
          jerseyNumber: playerForm.jerseyNumber
            ? Number(playerForm.jerseyNumber)
            : undefined,
          role: playerForm.role || undefined,
          battingStyle: playerForm.battingStyle,
          bowlingStyle: playerForm.bowlingStyle,
          bio: playerForm.bio,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          editingPlayer
            ? "Player updated successfully."
            : "Player added successfully.",
        );

        setShowPlayerForm(false);
        resetPlayerForm();

        fetchPlayers();
      } else {
        setMessage(data.message || "Failed to save player.");
      }
    } catch (error) {
      console.error("Error saving player:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setSavingPlayer(false);
    }
  };

  // ==========================================
  // OPEN STATISTICS FORM
  // ==========================================
  const openStatsForm = (player) => {
    setEditingStatsPlayer(player);

    setStatsForm({
      matchesPlayed: player.matchesPlayed || 0,
      totalRuns: player.totalRuns || 0,
      strikeRate: player.strikeRate || 0,
      bestScore: player.bestScore || 0,
      ballsFaced: player.ballsFaced || 0,
      sixes: player.sixes || 0,
      fours: player.fours || 0,
      singles: player.singles || 0,
    });

    setShowStatsForm(true);
  };

  // ==========================================
  // HANDLE STATISTICS INPUT
  // ==========================================
  const handleStatsChange = (e) => {
    const { name, value } = e.target;

    setStatsForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SAVE PLAYER STATISTICS
  // ==========================================
  const saveStats = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      setMessage("Admin account information not found.");
      return;
    }

    if (!editingStatsPlayer) {
      return;
    }

    try {
      setSavingStats(true);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/admin/players/${editingStatsPlayer._id}/stats`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user._id,
          },
          body: JSON.stringify({
            matchesPlayed: Number(statsForm.matchesPlayed) || 0,
            totalRuns: Number(statsForm.totalRuns) || 0,
            strikeRate: Number(statsForm.strikeRate) || 0,
            bestScore: Number(statsForm.bestScore) || 0,
            ballsFaced: Number(statsForm.ballsFaced) || 0,
            sixes: Number(statsForm.sixes) || 0,
            fours: Number(statsForm.fours) || 0,
            singles: Number(statsForm.singles) || 0,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Player statistics updated successfully.");

        setShowStatsForm(false);
        setEditingStatsPlayer(null);

        fetchPlayers();
      } else {
        setMessage(data.message || "Failed to update statistics.");
      }
    } catch (error) {
      console.error("Error updating statistics:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setSavingStats(false);
    }
  };

  // ==========================================
  // DELETE PLAYER
  // ==========================================
  const deletePlayer = async (playerId) => {
    if (!user?._id) {
      setMessage("Admin account information not found.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this player?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setProcessingPlayer(playerId);
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/admin/players/${playerId}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": user._id,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Player deleted successfully.");

        fetchPlayers();
      } else {
        setMessage(data.message || "Failed to delete player.");
      }
    } catch (error) {
      console.error("Error deleting player:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setProcessingPlayer(null);
    }
  };

  // ==========================================
  // SECURITY CHECK
  // ==========================================
  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <main className="min-vh-100 py-5">
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ color: "#d4af37" }}>
            ⭐ ALAMDAR STARS
          </h1>

          <h2 className="mt-3">🛠️ Admin Dashboard</h2>

          <p className="text-secondary">
            Manage players, registrations, captaincy and team information.
          </p>
        </div>

        {/* ADMIN INFORMATION */}
        <div className="card p-4 mb-4 text-center">
          <h3>Welcome, {user.name}</h3>

          <p className="text-secondary mb-0">
            You are logged in as an Administrator.
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="alert alert-info text-center">{message}</div>
        )}

        {/* ========================================== */}
        {/* PLAYER REGISTRATION REQUESTS */}
        {/* ========================================== */}
        <div
          className="card p-4 mb-4"
          style={{
            border: "1px solid #d4af37",
          }}
        >
          <div className="text-center mb-4">
            <h3>👤 Player Registration Requests</h3>

            <p className="text-secondary">
              Review players who are waiting for approval.
            </p>
          </div>

          {pendingLoading ? (
            <p className="text-center text-secondary">
              Loading registration requests...
            </p>
          ) : pendingPlayers.length === 0 ? (
            <div className="text-center">
              <p className="text-secondary mb-0">
                No pending player registrations.
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {pendingPlayers.map((pendingPlayer) => (
                <div className="col-md-6 col-lg-4" key={pendingPlayer._id}>
                  <div
                    className="card h-100 p-4"
                    style={{
                      border: "1px solid #ddd",
                    }}
                  >
                    <div className="text-center">
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "90px",
                          height: "90px",
                          borderRadius: "50%",
                          backgroundColor: "#eee",
                          fontSize: "40px",
                        }}
                      >
                        👤
                      </div>

                      <h4>{pendingPlayer.name}</h4>

                      <p className="mb-1">
                        <strong>Email:</strong> {pendingPlayer.email}
                      </p>

                      <p className="mb-3">
                        <strong>Phone:</strong> {pendingPlayer.phone}
                      </p>

                      <span
                        className="badge mb-3"
                        style={{
                          backgroundColor: "#fff3cd",
                          color: "#856404",
                          padding: "8px 12px",
                        }}
                      >
                        Pending Approval
                      </span>

                      <div className="d-flex gap-2">
                        <button
                          className="btn flex-fill"
                          style={{
                            backgroundColor: "#d4af37",
                            color: "#000",
                          }}
                          onClick={() => approvePlayer(pendingPlayer._id)}
                          disabled={processingPlayer === pendingPlayer._id}
                        >
                          {processingPlayer === pendingPlayer._id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          className="btn btn-outline-danger flex-fill"
                          onClick={() => rejectPlayer(pendingPlayer._id)}
                          disabled={processingPlayer === pendingPlayer._id}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* PLAYER MANAGEMENT */}
        {/* ========================================== */}
        <div className="card p-4">
          <div className="text-center mb-4">
            <h3> Manage Players</h3>

            <p className="text-secondary">
              Add, edit, delete players and manage captaincy.
            </p>

            <button
              className="btn mt-2"
              style={{
                backgroundColor: "#d4af37",
                color: "#000",
              }}
              onClick={openAddPlayerForm}
            >
              ➕ Add Player
            </button>
          </div>

          {showPlayerForm && (
            <div className="card p-4 mb-4">
              <h4 className="mb-4">
                {editingPlayer ? "✏️ Edit Player" : "➕ Add Player"}
              </h4>

              <form onSubmit={savePlayer}>
                <div className="row">
                  {/* NAME */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Player Name</label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={playerForm.name}
                      onChange={handlePlayerFormChange}
                      placeholder="Enter player name"
                      required
                    />
                  </div>

                  {/* JERSEY */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Jersey Number</label>

                    <input
                      type="number"
                      name="jerseyNumber"
                      className="form-control"
                      value={playerForm.jerseyNumber}
                      onChange={handlePlayerFormChange}
                      placeholder="Enter jersey number"
                    />
                  </div>

                  {/* ROLE */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Role</label>

                    <select
                      name="role"
                      className="form-select"
                      value={playerForm.role}
                      onChange={handlePlayerFormChange}
                    >
                      <option value="">Select role</option>
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="All-rounder">All-rounder</option>
                      <option value="Wicketkeeper">Wicketkeeper</option>
                    </select>
                  </div>

                  {/* BATTING STYLE */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Batting Style</label>

                    <input
                      type="text"
                      name="battingStyle"
                      className="form-control"
                      value={playerForm.battingStyle}
                      onChange={handlePlayerFormChange}
                      placeholder="e.g. Right-hand Bat"
                    />
                  </div>

                  {/* BOWLING STYLE */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Bowling Style</label>

                    <input
                      type="text"
                      name="bowlingStyle"
                      className="form-control"
                      value={playerForm.bowlingStyle}
                      onChange={handlePlayerFormChange}
                      placeholder="e.g. Right-arm Fast"
                    />
                  </div>

                  {/* BIO */}
                  <div className="col-12 mb-3">
                    <label className="mb-2">Bio</label>

                    <textarea
                      name="bio"
                      className="form-control"
                      rows="4"
                      value={playerForm.bio}
                      onChange={handlePlayerFormChange}
                      placeholder="Enter player bio"
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      backgroundColor: "#d4af37",
                      color: "#000",
                    }}
                    disabled={savingPlayer}
                  >
                    {savingPlayer
                      ? "Saving..."
                      : editingPlayer
                        ? "Update Player"
                        : "Add Player"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPlayerForm(false);
                      resetPlayerForm();
                    }}
                    disabled={savingPlayer}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {showStatsForm && (
            <div
              className="card p-4 mb-4"
              style={{
                border: "1px solid #d4af37",
              }}
            >
              <h4 className="mb-4">
                Edit Statistics
                {editingStatsPlayer && ` — ${editingStatsPlayer.name}`}
              </h4>

              <form onSubmit={saveStats}>
                <div className="row">
                  {/* MATCHES */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Matches Played</label>

                    <input
                      type="number"
                      min="0"
                      name="matchesPlayed"
                      className="form-control"
                      value={statsForm.matchesPlayed}
                      onChange={handleStatsChange}
                    />
                  </div>

                  {/* RUNS */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Total Runs</label>

                    <input
                      type="number"
                      min="0"
                      name="totalRuns"
                      className="form-control"
                      value={statsForm.totalRuns}
                      onChange={handleStatsChange}
                    />
                  </div>

                  {/* STRIKE RATE */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Strike Rate</label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      name="strikeRate"
                      className="form-control"
                      value={statsForm.strikeRate}
                      onChange={handleStatsChange}
                    />
                  </div>

                  {/* BEST SCORE */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Best Score</label>

                    <input
                      type="number"
                      min="0"
                      name="bestScore"
                      className="form-control"
                      value={statsForm.bestScore}
                      onChange={handleStatsChange}
                    />
                  </div>

                  {/* BALLS FACED */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Balls Faced</label>

                    <input
                      type="number"
                      min="0"
                      name="ballsFaced"
                      className="form-control"
                      value={statsForm.ballsFaced}
                      onChange={handleStatsChange}
                    />
                  </div>

                  {/* SIXES */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Sixes</label>

                    <input
                      type="number"
                      min="0"
                      name="sixes"
                      className="form-control"
                      value={statsForm.sixes}
                      onChange={handleStatsChange}
                    />
                  </div>

                  {/* FOURS */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Fours</label>

                    <input
                      type="number"
                      min="0"
                      name="fours"
                      className="form-control"
                      value={statsForm.fours}
                      onChange={handleStatsChange}
                    />
                  </div>

                  {/* SINGLES */}
                  <div className="col-md-6 mb-3">
                    <label className="mb-2">Singles</label>

                    <input
                      type="number"
                      min="0"
                      name="singles"
                      className="form-control"
                      value={statsForm.singles}
                      onChange={handleStatsChange}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn"
                    style={{
                      backgroundColor: "#d4af37",
                      color: "#000",
                    }}
                    disabled={savingStats}
                  >
                    {savingStats ? "Saving..." : "Save Statistics"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowStatsForm(false);
                      setEditingStatsPlayer(null);
                    }}
                    disabled={savingStats}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <p className="text-center text-secondary">Loading players...</p>
          ) : players.length === 0 ? (
            <p className="text-center text-secondary">No players found.</p>
          ) : (
            <div className="row g-4">
              {players.map((player) => (
                <div className="col-md-6 col-lg-4" key={player._id}>
                  <div
                    className="card h-100 p-4 text-center"
                    style={{
                      border: player.isCaptain
                        ? "2px solid #d4af37"
                        : "1px solid #ddd",
                    }}
                  >
                    {/* PHOTO */}

                    {player.photo ? (
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="mx-auto mb-3"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "50%",
                          border: "3px solid #d4af37",
                        }}
                      />
                    ) : (
                      <div
                        className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          backgroundColor: "#eee",
                          fontSize: "45px",
                        }}
                      >
                        👤
                      </div>
                    )}

                    <h4>{player.name}</h4>

                    <p className="text-secondary mb-2">
                      Role: {player.role || "Not specified"}
                    </p>

                    {player.jerseyNumber && (
                      <p className="text-secondary">
                        Jersey: {player.jerseyNumber}
                      </p>
                    )}

                    {/* CAPTAIN STATUS */}

                    {player.isCaptain ? (
                      <div>
                        <span
                          className="badge rounded-pill"
                          style={{
                            backgroundColor: "#d4af37",
                            color: "#000",
                            fontSize: "0.9rem",
                            padding: "8px 14px",
                          }}
                        >
                          👑 Current Captain
                        </span>
                      </div>
                    ) : (
                      <button
                        className="btn mt-3"
                        style={{
                          backgroundColor: "#d4af37",
                          color: "#000",
                        }}
                        onClick={() => assignCaptain(player._id)}
                        disabled={assigning}
                      >
                        {assigning ? "Updating..." : "Make Captain"}
                      </button>
                    )}

                    {/* EDIT AND DELETE */}
                    <div className="d-flex gap-2 mt-2">
                      <button
                        type="button"
                        className="btn btn-outline-primary flex-fill"
                        onClick={() => openEditPlayerForm(player)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger flex-fill"
                        onClick={() => deletePlayer(player._id)}
                        disabled={processingPlayer === player._id}
                      >
                        {processingPlayer === player._id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* OTHER ADMIN FEATURES */}
        {/* ========================================== */}

        <div className="row g-4 mt-4">
          <div className="col-md-4">
            <div
              className="card p-4 text-center h-100"
              style={{
                cursor: "pointer",
                border: "1px solid #d4af37",
              }}
              onClick={() => navigate("/matches")}
            >
              <h4> Matches</h4>

              <p className="text-secondary">
                Manage upcoming and completed matches.
              </p>

              <button
                className="btn mt-2"
                style={{
                  backgroundColor: "#d4af37",
                  color: "#000",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/matches");
                }}
              >
                Manage Matches
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card p-4 text-center h-100"
              style={{
                cursor: "pointer",
                border: "1px solid #d4af37",
              }}
              onClick={() => navigate("/admin/posts")}
            >
              <h4> Posts</h4>

              <p className="text-secondary">Manage team news and posts.</p>

              <button
                className="btn mt-2"
                style={{
                  backgroundColor: "#d4af37",
                  color: "#000",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/posts");
                }}
              >
                Manage Posts
              </button>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className="card p-4 text-center h-100"
              style={{
                cursor: "pointer",
                border: "1px solid #d4af37",
              }}
              onClick={() => navigate("/admin/team")}
            >
              <h4>👥 Team</h4>

              <p className="text-secondary">
                Manage team information, announcements and team settings.
              </p>

              <button
                className="btn mt-2"
                style={{
                  backgroundColor: "#d4af37",
                  color: "#000",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/team");
                }}
              >
                Manage Team
              </button>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="text-center mt-5">
          <button
            className="btn"
            style={{
              backgroundColor: "#111820",
              color: "#fff",
              border: "1px solid #d4af37",
            }}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
