import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [player, setPlayer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    jerseyNumber: "",
    role: "",
    battingStyle: "",
    bowlingStyle: "",
    bio: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // LOAD PLAYER
  useEffect(() => {
    if (!user?.player) {
      setMessage("No player profile is linked to this account.");
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/players/${user.player}`)
      .then((response) => response.json())
      .then((data) => {
        setPlayer(data);

        setFormData({
          name: data.name || "",
          photo: data.photo || "",
          jerseyNumber: data.jerseyNumber || "",
          role: data.role || "",
          battingStyle: data.battingStyle || "",
          bowlingStyle: data.bowlingStyle || "",
          bio: data.bio || "",
        });
      })
      .catch((error) => {
        console.error("Error loading profile:", error);
        setMessage("Unable to load profile.");
      });
  }, []);

  // UPLOAD PROFILE PHOTO
  // UPLOAD PROFILE PHOTO
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      setUploadingPhoto(true);
      setMessage("");

      const uploadData = new FormData();

      // Backend expects "media"
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
          photo: data.mediaUrl,
        }));

        setMessage("Profile photo uploaded successfully.");
      } else {
        setMessage(data.message || "Photo upload failed.");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      setMessage("Unable to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // UPDATE PROFILE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.player) {
      setMessage("No player profile found.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/players/${user.player}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": user._id,
          },
          body: JSON.stringify({
            name: formData.name,
            photo: formData.photo,
            jerseyNumber: formData.jerseyNumber,
            battingStyle: formData.battingStyle,
            bowlingStyle: formData.bowlingStyle,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setPlayer(data);
        setMessage("Profile updated successfully.");
      } else {
        setMessage(data.message || "Profile update failed.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="bg-dark text-white min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <h2>Please login first.</h2>

          <button
            className="btn mt-3"
            style={{
              backgroundColor: "#d4af37",
              color: "#000",
            }}
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-dark text-white min-vh-100 py-5">
      <div className="container">
        {/* HEADER */}
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ color: "#d4af37" }}>
            ⭐ ALAMDAR STARS
          </h1>

          <h2 className="mt-3">My Profile</h2>

          <p className="text-secondary">
            View and update your player information
          </p>
        </div>

        {/* PROFILE */}
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="card bg-black text-white border-secondary p-4">
              {/* PHOTO */}
              <div className="text-center mb-4">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Player"
                    style={{
                      width: "140px",
                      height: "140px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "3px solid #d4af37",
                    }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center mx-auto"
                    style={{
                      width: "140px",
                      height: "140px",
                      borderRadius: "50%",
                      backgroundColor: "#111820",
                      border: "3px solid #d4af37",
                      fontSize: "60px",
                    }}
                  >
                    👤
                  </div>
                )}

                {player?.isCaptain && (
                  <div className="mt-2">
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: "#d4af37",
                        color: "#000",
                      }}
                    >
                      👑
                    </span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                {/* NAME */}
                <div className="mb-3">
                  <label className="form-label">Player Name</label>

                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* PROFILE PHOTO UPLOAD */}
                <div className="mb-4">
                  <label className="form-label">Profile Photo</label>

                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />

                  <small className="text-secondary">
                    Choose a photo from your phone or computer.
                  </small>

                  {uploadingPhoto && (
                    <div className="text-warning mt-2">Uploading photo...</div>
                  )}
                </div>

                {/* JERSEY */}
                <div className="mb-3">
                  <label className="form-label">Jersey Number</label>

                  <input
                    type="number"
                    name="jerseyNumber"
                    className="form-control"
                    value={formData.jerseyNumber}
                    onChange={handleChange}
                  />
                </div>

                {/* BATTING STYLE */}
                <div className="mb-3">
                  <label className="form-label">Batting Style</label>

                  <select
                    name="battingStyle"
                    className="form-select"
                    value={formData.battingStyle}
                    onChange={handleChange}
                  >
                    <option value="">Select Batting Style</option>

                    <option value="Right-hand">Right-hand</option>

                    <option value="Left-hand">Left-hand</option>
                  </select>
                </div>

                {/* BOWLING STYLE */}
                <div className="mb-3">
                  <label className="form-label">Bowling Style</label>

                  <input
                    type="text"
                    name="bowlingStyle"
                    className="form-control"
                    placeholder="Example: Right-arm fast"
                    value={formData.bowlingStyle}
                    onChange={handleChange}
                  />
                </div>

                {/* SAVE */}
                <button
                  type="submit"
                  className="btn w-100"
                  style={{
                    backgroundColor: "#d4af37",
                    color: "#000",
                  }}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </form>

              {/* MESSAGE */}
              {message && <p className="text-center mt-3 mb-0">{message}</p>}

              {/* BACK TO DASHBOARD */}
              <button
                type="button"
                className="btn w-100 mt-3"
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
        </div>
      </div>
    </main>
  );
}

export default Profile;
