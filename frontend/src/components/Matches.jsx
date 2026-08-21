import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function Matches() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [searchParams] = useSearchParams();

  const statusFilter = searchParams.get("status");

  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [uploadingPromotionalPhoto, setUploadingPromotionalPhoto] =
    useState(false);
  const [uploadingPlayerOfMatchPhoto, setUploadingPlayerOfMatchPhoto] =
    useState(false);

  const [showPerformanceForm, setShowPerformanceForm] = useState(false);
  const [performanceMatch, setPerformanceMatch] = useState(null);
  const [savingPerformance, setSavingPerformance] = useState(false);

  const [performanceData, setPerformanceData] = useState([]);

  const [selectedPlayingXI, setSelectedPlayingXI] = useState([]);
  const [showPlayingXISelection, setShowPlayingXISelection] = useState(false);

  // ==========================================
  // FORM DATA
  // ==========================================

  const [formData, setFormData] = useState({
    opponent: "",
    promotionalPhoto: "",
    venue: "",
    date: "",
    time: "",
    tournament: "",
    status: "Upcoming",

    outcome: "",

    ourScore: "",
    opponentScore: "",
    result: "",

    playerOfMatch: "",
    playerOfMatchPhoto: "",
    playerOfMatchRuns: "",
    playerOfMatchWickets: "",
    playerOfMatchPerformance: "",
  });

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setFormData({
      opponent: "",
      promotionalPhoto: "",
      venue: "",
      date: "",
      time: "",
      tournament: "",
      status: "Upcoming",

      outcome: "",

      ourScore: "",
      opponentScore: "",
      result: "",

      playerOfMatch: "",
      playerOfMatchPhoto: "",
      playerOfMatchRuns: "",
      playerOfMatchWickets: "",
      playerOfMatchPerformance: "",
    });

    setEditingMatchId(null);
  };

  // ==========================================
  // FETCH MATCHES
  // ==========================================

  const fetchMatches = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/matches`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }

      const data = await response.json();

      if (statusFilter) {
        setMatches(data.filter((match) => match.status === statusFilter));
      } else {
        setMatches(data);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      setMessage("Unable to load matches.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH PLAYERS
  // ==========================================

  const fetchPlayers = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/players`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }

      const data = await response.json();

      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, [statusFilter]);

  // ==========================================
  // HANDLE NORMAL INPUT
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // UPLOAD PROMOTIONAL PHOTO
  // ==========================================

  const handlePromotionalPhotoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      setUploadingPromotionalPhoto(true);
      setMessage("");

      const uploadData = new FormData();

      uploadData.append("media", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload/media`,
        {
          method: "POST",
          body: uploadData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        setFormData((previous) => ({
          ...previous,
          promotionalPhoto: data.mediaUrl,
        }));

        setMessage("Promotional photo uploaded successfully.");
      } else {
        setMessage(data.message || "Promotional photo upload failed.");
      }
    } catch (error) {
      console.error("Error uploading promotional photo:", error);

      setMessage("Unable to upload promotional photo.");
    } finally {
      setUploadingPromotionalPhoto(false);
    }
  };

  // ==========================================
  // UPLOAD PLAYER OF THE MATCH PHOTO
  // ==========================================

  const handlePlayerOfMatchPhotoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    try {
      setUploadingPlayerOfMatchPhoto(true);
      setMessage("");

      const uploadData = new FormData();

      uploadData.append("media", file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/upload/media`,
        {
          method: "POST",
          body: uploadData,
        },
      );

      const data = await response.json();

      if (response.ok) {
        setFormData((previous) => ({
          ...previous,
          playerOfMatchPhoto: data.mediaUrl,
        }));

        setMessage("Player of the Match photo uploaded successfully.");
      } else {
        setMessage(data.message || "Player of the Match photo upload failed.");
      }
    } catch (error) {
      console.error("Error uploading Player of the Match photo:", error);

      setMessage("Unable to upload Player of the Match photo.");
    } finally {
      setUploadingPlayerOfMatchPhoto(false);
    }
  };

  // ==========================================
  // HANDLE STATUS CHANGE
  // ==========================================

  const handleStatusChange = (e) => {
    const value = e.target.value;

    setFormData((previous) => ({
      ...previous,
      status: value,

      // If match is no longer completed,
      // remove completed-match information.
      ...(value !== "Completed"
        ? {
            outcome: "",
            ourScore: "",
            opponentScore: "",
            result: "",
            playerOfMatch: "",
            playerOfMatchRuns: "",
            playerOfMatchWickets: "",
            playerOfMatchPerformance: "",
          }
        : {}),
    }));
  };

  // ==========================================
  // HANDLE OUTCOME CHANGE
  // ==========================================

  const handleOutcomeChange = (e) => {
    const value = e.target.value;

    setFormData((previous) => ({
      ...previous,
      outcome: value,

      // Lost and No Result have no Player of Match
      ...(value === "Lost" || value === "No Result"
        ? {
            playerOfMatch: "",
            playerOfMatchRuns: "",
            playerOfMatchWickets: "",
            playerOfMatchPerformance: "",
          }
        : {}),
    }));
  };

  // ==========================================
  // EDIT MATCH
  // ==========================================

  const handleEdit = (match) => {
    setFormData({
      opponent: match.opponent || "",

      promotionalPhoto: match.promotionalPhoto || "",

      venue: match.venue || "",

      date: match.date ? new Date(match.date).toISOString().split("T")[0] : "",

      time: match.time || "",

      tournament: match.tournament || "",

      status: match.status || "Upcoming",

      outcome: match.outcome || "",

      ourScore: match.ourScore || "",

      opponentScore: match.opponentScore || "",

      result: match.result || "",

      playerOfMatch: match.playerOfMatch?._id || match.playerOfMatch || "",
      playerOfMatchPhoto: match.playerOfMatchPhoto || "",

      playerOfMatchRuns: match.playerOfMatchRuns || "",

      playerOfMatchWickets: match.playerOfMatchWickets || "",

      playerOfMatchPerformance: match.playerOfMatchPerformance || "",
    });

    setEditingMatchId(match._id);

    setShowForm(true);

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================
  // ADD / UPDATE MATCH
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const isEditing = Boolean(editingMatchId);

      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/matches/${editingMatchId}`
        : `${import.meta.env.VITE_API_URL}/api/matches`;

      // ==========================================
      // PREPARE DATA
      // ==========================================

      console.log("PROMOTIONAL PHOTO BEFORE SAVE:", formData.promotionalPhoto);
      const dataToSend = {
        opponent: formData.opponent.trim(),

        promotionalPhoto: formData.promotionalPhoto || "",
        playerOfMatchPhoto: formData.playerOfMatchPhoto || "",

        venue: formData.venue.trim(),

        date: formData.date,

        time: formData.time,

        tournament: formData.tournament.trim(),

        status: formData.status,

        outcome: formData.status === "Completed" ? formData.outcome : "",

        ourScore:
          formData.status === "Completed" ? formData.ourScore.trim() : "",

        opponentScore:
          formData.status === "Completed" ? formData.opponentScore.trim() : "",

        result: formData.status === "Completed" ? formData.result.trim() : "",

        playerOfMatch:
          formData.status === "Completed" &&
          (formData.outcome === "Won" || formData.outcome === "Draw")
            ? formData.playerOfMatch || null
            : null,

        playerOfMatchRuns:
          formData.status === "Completed" &&
          (formData.outcome === "Won" || formData.outcome === "Draw")
            ? formData.playerOfMatchRuns.trim()
            : "",

        playerOfMatchWickets:
          formData.status === "Completed" &&
          (formData.outcome === "Won" || formData.outcome === "Draw")
            ? formData.playerOfMatchWickets.trim()
            : "",

        playerOfMatchPerformance:
          formData.status === "Completed" &&
          (formData.outcome === "Won" || formData.outcome === "Draw")
            ? formData.playerOfMatchPerformance.trim()
            : "",
      };

      // ==========================================
      // SEND REQUEST
      // ==========================================

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
          "x-user-id": user._id,
        },

        body: JSON.stringify(dataToSend),
      });

      // ==========================================
      // READ RESPONSE
      // ==========================================

      const data = await response.json();

      // ==========================================
      // SUCCESS
      // ==========================================

      if (response.ok) {
        setMessage(
          isEditing
            ? "Match updated successfully."
            : "Match added successfully.",
        );

        resetForm();

        setShowForm(false);

        await fetchMatches();

        return;
      }

      // ==========================================
      // SERVER ERROR
      // ==========================================

      console.error("Server response:", data);

      setMessage(
        data.message ||
          (isEditing ? "Failed to update match." : "Failed to add match."),
      );
    } catch (error) {
      console.error("Error saving match:", error);

      setMessage(
        "Unable to connect to server. Make sure your backend is running.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // OPEN MATCH PERFORMANCE FORM
  // ==========================================
  const openPerformanceForm = (match) => {
    setPerformanceMatch(match);

    // If performances already exist, load the saved players
    if (match.playerPerformances && match.playerPerformances.length > 0) {
      const existingPerformances = match.playerPerformances.map(
        (performance) => ({
          player: performance.player?._id || performance.player || "",

          runs: performance.runs || 0,
          wickets: performance.wickets || 0,
          ballsFaced: performance.ballsFaced || 0,
          ballsBowled: performance.ballsBowled || 0,
          fours: performance.fours || 0,
          sixes: performance.sixes || 0,
          singles: performance.singles || 0,
        }),
      );

      setPerformanceData(existingPerformances);

      // Existing players are automatically the Playing XI
      setSelectedPlayingXI(
        existingPerformances.map((performance) => performance.player),
      );

      setShowPlayingXISelection(false);
    } else {
      // New completed match:
      // Start with no players selected.
      setPerformanceData([]);
      setSelectedPlayingXI([]);
      setShowPlayingXISelection(true);
    }

    setShowPerformanceForm(true);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  // ==========================================
  // HANDLE PERFORMANCE CHANGE
  // ==========================================
  const handlePerformanceChange = (index, field, value) => {
    setPerformanceData((previous) =>
      previous.map((performance, i) =>
        i === index
          ? {
              ...performance,
              [field]: value,
            }
          : performance,
      ),
    );
  };

  // ==========================================
  // SAVE MATCH PERFORMANCE
  // ==========================================
  const savePerformance = async (e) => {
    e.preventDefault();

    if (!performanceMatch) {
      return;
    }

    if (!user?._id || user.role !== "admin") {
      setMessage("Only administrators can enter player performances.");
      return;
    }

    try {
      setSavingPerformance(true);
      setMessage("");

      const cleanedPerformance = performanceData.map((performance) => {
        const runs = Math.max(0, Number(performance.runs) || 0);

        const fours = Math.max(0, Number(performance.fours) || 0);

        const sixes = Math.max(0, Number(performance.sixes) || 0);

        const singles = Math.max(0, runs - fours * 4 - sixes * 6);

        return {
          player: performance.player,

          runs,

          wickets: Math.max(0, Number(performance.wickets) || 0),

          ballsFaced: Math.max(0, Number(performance.ballsFaced) || 0),

          ballsBowled: Math.max(0, Number(performance.ballsBowled) || 0),

          fours,

          sixes,

          singles,
        };
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/matches/${performanceMatch._id}/performances`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user._id,
          },
          body: JSON.stringify({
            playerPerformances: cleanedPerformance,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Match performances saved successfully.");

        setShowPerformanceForm(false);
        setPerformanceMatch(null);
        setPerformanceData([]);

        await fetchMatches();
      } else {
        setMessage(data.message || "Failed to save match performances.");
      }
    } catch (error) {
      console.error("Error saving match performances:", error);

      setMessage("Unable to connect to server.");
    } finally {
      setSavingPerformance(false);
    }
  };

  // ==========================================
  // DELETE MATCH
  // ==========================================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this match?",
    );

    if (!confirmDelete) {
      return;
    }

    if (!user?._id || user.role !== "admin") {
      setMessage("Only administrators can delete matches.");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/matches/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user._id,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Match deleted successfully.");

        fetchMatches();
      } else {
        setMessage(data.message || "Failed to delete match.");
      }
    } catch (error) {
      console.error("Error deleting match:", error);

      setMessage("Unable to connect to server.");
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

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

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "Live") {
      return "bg-danger";
    }

    if (status === "Completed") {
      return "bg-success";
    }

    return "bg-warning text-dark";
  };

  // ==========================================
  // OUTCOME CLASS
  // ==========================================

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

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-vh-100 py-5">
        <div className="container text-center">
          <h2>Loading matches...</h2>
        </div>
      </main>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="min-vh-100 py-5">
      <div className="container">
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="text-center mb-5">
          <h1
            className="fw-bold"
            style={{
              color: "#1f2937",
              fontSize: "3rem",
            }}
          >
            ALAMDAR STARS
          </h1>

          <h2 className="mt-3">
            {statusFilter === "Upcoming"
              ? "Upcoming Matches"
              : statusFilter === "Live"
                ? "Live Matches"
                : statusFilter === "Completed"
                  ? "Completed Matches"
                  : "Matches"}
          </h2>

          <p className="text-secondary">
            {statusFilter === "Upcoming"
              ? "View all upcoming Alamdar Stars matches"
              : "Upcoming, live and completed matches"}
          </p>
        </div>

        {/* ==========================================
            ADMIN ADD BUTTON
        ========================================== */}

        {user?.role === "admin" && (
          <div className="text-end mb-4">
            <button
              className="btn"
              style={{
                backgroundColor: "#d4af37",
                color: "#171717",
              }}
              onClick={() => {
                if (showForm) {
                  setShowForm(false);
                  resetForm();
                } else {
                  resetForm();
                  setShowForm(true);
                  setMessage("");
                }
              }}
            >
              {showForm ? "✕ Close" : "+ Add Match"}
            </button>
          </div>
        )}

        {/* ==========================================
            MESSAGE
        ========================================== */}

        {message && (
          <div className="alert alert-info text-center">{message}</div>
        )}

        {/* ==========================================
            ADD / EDIT MATCH FORM
        ========================================== */}

        {showForm && user?.role === "admin" && (
          <div className="card p-4 mb-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold">
                {editingMatchId ? "Edit Match" : "Add New Match"}
              </h3>

              <p className="text-secondary mb-0">
                {editingMatchId
                  ? "Update the match information below"
                  : "Enter the match information below"}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* ==========================================
                    OPPONENT
                ========================================== */}

                <div className="col-md-6">
                  <label className="form-label">Opponent Team *</label>

                  <input
                    type="text"
                    name="opponent"
                    className="form-control"
                    placeholder="Example: Kashmir Kings"
                    value={formData.opponent}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* ==========================================
                    VENUE
                ========================================== */}

                <div className="col-md-6">
                  <label className="form-label">Venue *</label>

                  <input
                    type="text"
                    name="venue"
                    className="form-control"
                    placeholder="Example: Sher-e-Kashmir Stadium"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* ==========================================
                    DATE
                ========================================== */}

                <div className="col-md-4">
                  <label className="form-label">Date *</label>

                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* ==========================================
                    TIME
                ========================================== */}

                <div className="col-md-4">
                  <label className="form-label">Time *</label>

                  <input
                    type="time"
                    name="time"
                    className="form-control"
                    value={formData.time}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* ==========================================
                    STATUS
                ========================================== */}

                <div className="col-md-4">
                  <label className="form-label">Status</label>

                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={handleStatusChange}
                  >
                    <option value="Upcoming">Upcoming</option>

                    <option value="Live">Live</option>

                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* ==========================================
                    COMPLETED MATCH DETAILS
                ========================================== */}

                {formData.status === "Completed" && (
                  <>
                    {/* ==========================================
                        OUTCOME
                    ========================================== */}

                    <div className="col-md-4">
                      <label className="form-label">Match Outcome *</label>

                      <select
                        name="outcome"
                        className="form-select"
                        value={formData.outcome}
                        onChange={handleOutcomeChange}
                        required
                      >
                        <option value="">Select Outcome</option>

                        <option value="Won">Won</option>

                        <option value="Lost">Lost</option>

                        <option value="Draw">Draw</option>

                        <option value="No Result">No Result</option>
                      </select>
                    </div>

                    {/* ==========================================
                        OUR SCORE
                    ========================================== */}

                    <div className="col-md-4">
                      <label className="form-label">Alamdar Stars Score</label>

                      <input
                        type="text"
                        name="ourScore"
                        className="form-control"
                        placeholder="Example: 145/6"
                        value={formData.ourScore}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ==========================================
                        OPPONENT SCORE
                    ========================================== */}

                    <div className="col-md-4">
                      <label className="form-label">Opponent Score</label>

                      <input
                        type="text"
                        name="opponentScore"
                        className="form-control"
                        placeholder="Example: 142/8"
                        value={formData.opponentScore}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ==========================================
                        MATCH RESULT
                    ========================================== */}

                    <div className="col-12">
                      <label className="form-label">Match Result</label>

                      <input
                        type="text"
                        name="result"
                        className="form-control"
                        placeholder="Example: Alamdar Stars won by 3 runs"
                        value={formData.result}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ==========================================
                        PLAYER OF MATCH SECTION
                    ========================================== */}

                    {(formData.outcome === "Won" ||
                      formData.outcome === "Draw") && (
                      <>
                        {/* PLAYER OF MATCH */}

                        <div className="col-md-6">
                          <label className="form-label">
                            Player of the Match
                            {formData.outcome === "Won" && <span> *</span>}
                            {formData.outcome === "Draw" && (
                              <span className="text-secondary">
                                {" "}
                                (Optional)
                              </span>
                            )}
                          </label>

                          <select
                            name="playerOfMatch"
                            className="form-select"
                            value={formData.playerOfMatch}
                            onChange={handleChange}
                            required={formData.outcome === "Won"}
                          >
                            <option value="">
                              {formData.outcome === "Won"
                                ? "Select Player"
                                : "Select Player (Optional)"}
                            </option>

                            {players.map((player) => (
                              <option key={player._id} value={player._id}>
                                {player.name}

                                {player.jerseyNumber
                                  ? ` - #${player.jerseyNumber}`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* PLAYER RUNS */}

                        <div className="col-md-6">
                          <label className="form-label">
                            Player Runs
                            {formData.outcome === "Won" && <span> *</span>}
                            {formData.outcome === "Draw" && (
                              <span className="text-secondary">
                                {" "}
                                (Optional)
                              </span>
                            )}
                          </label>

                          <input
                            type="text"
                            name="playerOfMatchRuns"
                            className="form-control"
                            placeholder="Example: 45"
                            value={formData.playerOfMatchRuns}
                            onChange={handleChange}
                            required={formData.outcome === "Won"}
                          />
                        </div>

                        {/* PLAYER WICKETS */}

                        <div className="col-md-6">
                          <label className="form-label">
                            Player Wickets
                            {formData.outcome === "Draw" && (
                              <span className="text-secondary">
                                {" "}
                                (Optional)
                              </span>
                            )}
                          </label>

                          <input
                            type="text"
                            name="playerOfMatchWickets"
                            className="form-control"
                            placeholder="Example: 2"
                            value={formData.playerOfMatchWickets}
                            onChange={handleChange}
                          />
                        </div>

                        {/* PLAYER OF THE MATCH PHOTO */}

                        <div className="col-md-6">
                          <label className="form-label">
                            Player of the Match Photo
                            <span className="text-secondary"> (Optional)</span>
                          </label>

                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handlePlayerOfMatchPhotoUpload}
                            disabled={uploadingPlayerOfMatchPhoto}
                          />

                          <small className="text-secondary">
                            Optional special photo for the Player of the Match
                            story.
                          </small>

                          {uploadingPlayerOfMatchPhoto && (
                            <div className="text-warning mt-2">
                              Uploading player photo...
                            </div>
                          )}

                          {formData.playerOfMatchPhoto &&
                            !uploadingPlayerOfMatchPhoto && (
                              <div className="text-success mt-2">
                                Player of the Match photo uploaded successfully.
                              </div>
                            )}
                        </div>

                        {/* PLAYER PERFORMANCE */}

                        <div className="col-md-6">
                          <label className="form-label">
                            Performance Summary
                            {formData.outcome === "Draw" && (
                              <span className="text-secondary">
                                {" "}
                                (Optional)
                              </span>
                            )}
                          </label>

                          <input
                            type="text"
                            name="playerOfMatchPerformance"
                            className="form-control"
                            placeholder="Example: 45 runs and 2 wickets"
                            value={formData.playerOfMatchPerformance}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    {/* ==========================================
                        TOURNAMENT
                    ========================================== */}

                    <div className="col-md-6">
                      <label className="form-label">Tournament</label>

                      <input
                        type="text"
                        name="tournament"
                        className="form-control"
                        placeholder="Example: Kashmir Premier League"
                        value={formData.tournament}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                {/* ==========================================
                    TOURNAMENT FOR UPCOMING/LIVE
                ========================================== */}

                {formData.status !== "Completed" && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Tournament</label>

                      <input
                        type="text"
                        name="tournament"
                        className="form-control"
                        placeholder="Example: Kashmir Premier League"
                        value={formData.tournament}
                        onChange={handleChange}
                      />
                    </div>

                    {/* ==========================================
    PROMOTIONAL PHOTO
========================================== */}

                    <div className="col-12">
                      <label className="form-label">
                        Promotional Photo
                        <span className="text-secondary"> (Optional)</span>
                      </label>

                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handlePromotionalPhotoUpload}
                        disabled={uploadingPromotionalPhoto}
                      />

                      <small className="text-secondary">
                        Upload a promotional image for this match story.
                      </small>

                      {uploadingPromotionalPhoto && (
                        <div className="text-warning mt-2">
                          Uploading promotional photo...
                        </div>
                      )}

                      {formData.promotionalPhoto &&
                        !uploadingPromotionalPhoto && (
                          <div className="text-success mt-2">
                            Promotional photo uploaded successfully.
                          </div>
                        )}
                    </div>
                  </>
                )}
              </div>

              {/* ==========================================
                  BUTTONS
              ========================================== */}

              <div className="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  className="btn flex-fill"
                  style={{
                    backgroundColor: "#d4af37",
                    color: "#171717",
                  }}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingMatchId
                      ? "Update Match"
                      : "Save Match"}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary flex-fill"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ==========================================
    MATCH PERFORMANCE FORM
========================================== */}

        {showPerformanceForm && performanceMatch && user?.role === "admin" && (
          <div
            className="card p-4 mb-5"
            style={{
              border: "1px solid #d4af37",
            }}
          >
            <div className="text-center mb-4">
              <h3 className="fw-bold">🏏 Match Performance</h3>

              <p className="text-secondary mb-1">
                Alamdar Stars vs {performanceMatch.opponent}
              </p>

              <small className="text-secondary">
                Select the players who played this match.
              </small>
            </div>

            {/* ==========================================
          PLAYING XI SELECTION
      ========================================== */}

            {showPlayingXISelection && (
              <div
                className="card p-4 mb-4"
                style={{
                  border: "1px solid #d4af37",
                }}
              >
                <div className="text-center mb-4">
                  <h4>🏏 Select Playing XI</h4>

                  <p className="text-secondary mb-1">
                    Select the players who played this match (maximum 12).
                  </p>

                  <strong style={{ color: "#d4af37" }}>
                    {selectedPlayingXI.length} / 12 Selected
                  </strong>
                </div>

                <div className="row g-3">
                  {players.map((player) => {
                    const isSelected = selectedPlayingXI.includes(player._id);

                    return (
                      <div className="col-md-6 col-lg-4" key={player._id}>
                        <button
                          type="button"
                          className="w-100 text-start"
                          style={{
                            border: isSelected
                              ? "2px solid #d4af37"
                              : "1px solid #ddd",
                            backgroundColor: isSelected ? "#fff8dc" : "#fff",
                            borderRadius: "10px",
                            padding: "12px",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            setSelectedPlayingXI((previous) => {
                              if (previous.includes(player._id)) {
                                return previous.filter(
                                  (id) => id !== player._id,
                                );
                              }

                              if (previous.length >= 12) {
                                setMessage(
                                  "A maximum of 12 players can be selected.",
                                );

                                return previous;
                              }
                              return [...previous, player._id];
                            });
                          }}
                        >
                          <div className="d-flex align-items-center gap-3">
                            {player.photo ? (
                              <img
                                src={player.photo}
                                alt={player.name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "50%",
                                  backgroundColor: "#eee",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "24px",
                                }}
                              >
                                👤
                              </div>
                            )}

                            <div>
                              <strong>{player.name}</strong>

                              <div className="text-secondary small">
                                {player.role || "Player"}
                              </div>
                            </div>

                            <div className="ms-auto">
                              {isSelected ? "✅" : "⬜"}
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    className="btn"
                    style={{
                      backgroundColor: "#d4af37",
                      color: "#000",
                    }}
                    disabled={selectedPlayingXI.length === 0}
                    onClick={() => {
                      const selectedPerformances = selectedPlayingXI.map(
                        (playerId) => ({
                          player: playerId,
                          runs: 0,
                          wickets: 0,
                          ballsFaced: 0,
                          ballsBowled: 0,
                          fours: 0,
                          sixes: 0,
                          singles: 0,
                        }),
                      );

                      setPerformanceData(selectedPerformances);
                      setShowPlayingXISelection(false);
                      setMessage("");
                    }}
                  >
                    Continue to Performance
                  </button>
                </div>
              </div>
            )}

            {/* ==========================================
          PERFORMANCE FORM
      ========================================== */}

            {!showPlayingXISelection && (
              <form onSubmit={savePerformance}>
                {performanceData.length === 0 ? (
                  <div className="alert alert-warning text-center">
                    No players are available.
                  </div>
                ) : (
                  performanceData.map((performance, index) => {
                    const player = players.find(
                      (item) => item._id === performance.player,
                    );

                    return (
                      <div
                        key={`${performance.player}-${index}`}
                        className="card p-3 mb-3"
                        style={{
                          border: "1px solid #ddd",
                        }}
                      >
                        <h5 className="fw-bold mb-3">
                          {player?.name || "Unknown Player"}
                          {player?.jerseyNumber
                            ? ` #${player.jerseyNumber}`
                            : ""}
                        </h5>

                        <div className="row g-3">
                          {/* RUNS */}
                          <div className="col-6 col-md-2">
                            <label className="form-label">Runs</label>

                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              value={performance.runs}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  index,
                                  "runs",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          {/* WICKETS */}
                          <div className="col-6 col-md-2">
                            <label className="form-label">Wickets</label>

                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              value={performance.wickets}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  index,
                                  "wickets",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          {/* BALLS FACED */}
                          <div className="col-6 col-md-2">
                            <label className="form-label">Balls Faced</label>

                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              value={performance.ballsFaced}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  index,
                                  "ballsFaced",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          {/* BALLS BOWLED */}
                          <div className="col-6 col-md-2">
                            <label className="form-label">Balls Bowled</label>

                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              value={performance.ballsBowled}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  index,
                                  "ballsBowled",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          {/* FOURS */}
                          <div className="col-6 col-md-2">
                            <label className="form-label">Fours</label>

                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              value={performance.fours}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  index,
                                  "fours",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          {/* SIXES */}
                          <div className="col-6 col-md-2">
                            <label className="form-label">Sixes</label>

                            <input
                              type="number"
                              min="0"
                              className="form-control"
                              value={performance.sixes}
                              onChange={(e) =>
                                handlePerformanceChange(
                                  index,
                                  "sixes",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn flex-fill"
                    style={{
                      backgroundColor: "#d4af37",
                      color: "#171717",
                    }}
                    disabled={performanceData.length === 0}
                  >
                    {savingPerformance ? "Saving..." : "Save Performance"}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary flex-fill"
                    onClick={() => {
                      setShowPerformanceForm(false);
                      setPerformanceMatch(null);
                      setPerformanceData([]);
                      setSelectedPlayingXI([]);
                      setShowPlayingXISelection(false);
                    }}
                    disabled={savingPerformance}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ==========================================
            MATCH LIST
        ========================================== */}

        {matches.length === 0 ? (
          <div className="card text-center p-5">
            <div
              style={{
                fontSize: "4rem",
              }}
            >
              🏏
            </div>

            <h3 className="mt-3">No Matches Yet</h3>

            <p className="text-secondary mb-0">
              Match information will appear here once a match is added.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {matches.map((match) => (
              <div className="col-lg-6" key={match._id}>
                <div className="card h-100 p-4">
                  {/* ==========================================
                      STATUS
                  ========================================== */}

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className={`badge ${getStatusClass(match.status)}`}>
                      {match.status}
                    </span>

                    {match.tournament && (
                      <span className="text-secondary">{match.tournament}</span>
                    )}
                  </div>

                  {/* ==========================================
                      TEAMS
                  ========================================== */}

                  <div className="text-center">
                    <div
                      style={{
                        fontSize: "4rem",
                      }}
                    >
                      🏏
                    </div>
                    <h2 className="fw-bold mt-3">
                      Alamdar Stars
                      <span
                        className="mx-2"
                        style={{
                          color: "#d4af37",
                        }}
                      >
                        vs
                      </span>
                      {match.opponent}
                    </h2>
                  </div>

                  {/* ==========================================
                      INFORMATION
                  ========================================== */}

                  <div className="mt-4">
                    <div className="mb-2">
                      📅 <strong>Date:</strong> {formatDate(match.date)}
                    </div>

                    <div className="mb-2">
                      🕐 <strong>Time:</strong> {match.time || "—"}
                    </div>

                    <div className="mb-2">
                      📍 <strong>Venue:</strong> {match.venue || "—"}
                    </div>
                  </div>

                  {/* ==========================================
                      COMPLETED MATCH
                  ========================================== */}

                  {match.status === "Completed" && (
                    <>
                      {/* OUTCOME */}

                      {match.outcome && (
                        <div className="text-center mt-3">
                          <h4
                            className={`fw-bold ${getOutcomeClass(
                              match.outcome,
                            )}`}
                          >
                            {match.outcome === "Won"
                              ? "🏆 WON"
                              : match.outcome === "Lost"
                                ? "❌ LOST"
                                : match.outcome === "Draw"
                                  ? "🤝 DRAW"
                                  : "⚪ NO RESULT"}
                          </h4>
                        </div>
                      )}

                      {/* SCORE */}

                      <div
                        className="text-center mt-3 p-3"
                        style={{
                          backgroundColor: "#f1f2f4",
                          borderRadius: "10px",
                        }}
                      >
                        <h4 className="fw-bold">Match Result</h4>

                        <h3>
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
                        </h3>

                        <p
                          className="fw-bold mb-0"
                          style={{
                            color: "#d4af37",
                          }}
                        >
                          {match.result ||
                            (match.outcome === "Won"
                              ? "Alamdar Stars won the match"
                              : match.outcome === "Lost"
                                ? "Alamdar Stars lost the match"
                                : match.outcome === "Draw"
                                  ? "Match ended in a draw"
                                  : match.outcome === "No Result"
                                    ? "Match ended with no result"
                                    : "")}
                        </p>
                      </div>
                    </>
                  )}

                  {/* ==========================================
                          MATCH PERFORMANCE
                      ========================================== */}

                  {match.playerPerformances &&
                    match.playerPerformances.length > 0 && (
                      <div
                        className="mt-4 p-3"
                        style={{
                          backgroundColor: "#f8f9fa",
                          borderRadius: "10px",
                          border: "1px solid #ddd",
                        }}
                      >
                        <div className="text-center mb-3">
                          <h4 className="fw-bold mb-1">🏏 Match Performance</h4>

                          <p className="text-secondary mb-0">
                            Player performances from this match
                          </p>
                        </div>

                        {match.playerPerformances.map((performance) => (
                          <div
                            key={`${performance.player?._id || performance.player}-${performance.runs}-${performance.wickets}`}
                            className="d-flex justify-content-between align-items-center py-3 border-bottom"
                          >
                            <div>
                              <strong>
                                {performance.player?.name || "Unknown Player"}
                              </strong>

                              {performance.player?.jerseyNumber && (
                                <small className="text-secondary ms-2">
                                  #{performance.player.jerseyNumber}
                                </small>
                              )}
                            </div>

                            <div className="text-end">
                              <div className="fw-bold">
                                {performance.runs} Runs
                                {performance.wickets > 0 &&
                                  ` • ${performance.wickets} Wicket${
                                    performance.wickets !== 1 ? "s" : ""
                                  }`}
                              </div>

                              <small className="text-secondary">
                                {performance.ballsFaced} Balls
                                {" • "}
                                {performance.fours} Fours
                                {" • "}
                                {performance.sixes} Sixes
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* ==========================================
                      PLAYER OF MATCH CARD
                  ========================================== */}

                  {match.playerOfMatch && (
                    <div
                      className="text-center mt-4 p-3"
                      style={{
                        backgroundColor: "#fffaf0",
                        borderRadius: "10px",
                        border: "1px solid #d4af37",
                      }}
                    >
                      <p className="text-secondary mb-2">
                        ⭐ Player of the Match
                      </p>

                      {match.playerOfMatch.photo && (
                        <img
                          src={match.playerOfMatch.photo}
                          alt={match.playerOfMatch.name}
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "3px solid #d4af37",
                          }}
                        />
                      )}

                      <h5 className="mt-2 mb-2">{match.playerOfMatch.name}</h5>

                      {/* PLAYER STATISTICS */}

                      {(match.playerOfMatchRuns ||
                        match.playerOfMatchWickets) && (
                        <p className="mb-1 fw-bold">
                          {match.playerOfMatchRuns &&
                            `${match.playerOfMatchRuns} Runs`}

                          {match.playerOfMatchRuns &&
                            match.playerOfMatchWickets &&
                            " • "}

                          {match.playerOfMatchWickets &&
                            `${match.playerOfMatchWickets} Wickets`}
                        </p>
                      )}

                      {match.playerOfMatchPerformance && (
                        <p className="text-secondary mb-0">
                          {match.playerOfMatchPerformance}
                        </p>
                      )}
                    </div>
                  )}
                  {/* ==========================================
                                ADMIN CONTROLS
                    ========================================== */}

                  {user?.role === "admin" && (
                    <div className="d-flex gap-2 mt-4">
                      {match.status === "Completed" && (
                        <button
                          type="button"
                          className="btn flex-fill"
                          style={{
                            backgroundColor: "#d4af37",
                            color: "#171717",
                          }}
                          onClick={() => openPerformanceForm(match)}
                        >
                          {match.playerPerformances &&
                          match.playerPerformances.length > 0
                            ? "Edit Performance"
                            : "Enter Performance"}
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-outline-secondary flex-fill"
                        onClick={() => handleEdit(match)}
                      >
                        Edit Match
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-danger flex-fill"
                        onClick={() => handleDelete(match._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Matches;
