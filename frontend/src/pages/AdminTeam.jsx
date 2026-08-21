import { useNavigate } from "react-router-dom";

function AdminTeam() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Admin access check
  if (!user || user.role !== "admin") {
    navigate("/dashboard");
    return null;
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
            ⭐ ALAMDAR STARS
          </h1>

          <h2 className="mt-3">👥 Team Management</h2>

          <p className="text-secondary">
            Manage team information, announcements and other team settings.
          </p>
        </div>

        {/* TEAM MANAGEMENT OPTIONS */}
        <div className="row g-4">
          {/* ANNOUNCEMENTS */}
          <div className="col-md-6 col-lg-4">
            <div
              className="card p-4 text-center h-100"
              style={{
                border: "1px solid #d4af37",
              }}
            >
              <h4>📢 Announcements</h4>

              <p className="text-secondary">
                Create and manage official team announcements and updates.
              </p>

              <button
                className="btn mt-auto"
                style={{
                  backgroundColor: "#d4af37",
                  color: "#000",
                }}
                onClick={() => navigate("/admin/announcements")}
              >
                Manage Announcements
              </button>
            </div>
          </div>

          {/* TEAM INFORMATION */}
          <div className="col-md-6 col-lg-4">
            <div
              className="card p-4 text-center h-100"
              style={{
                border: "1px solid #d4af37",
              }}
            >
              <h4>👥 Team Information</h4>

              <p className="text-secondary">
                Manage basic Alamdar Stars team information.
              </p>

              <button
                className="btn mt-auto"
                style={{
                  backgroundColor: "#d4af37",
                  color: "#000",
                }}
                disabled
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="col-md-6 col-lg-4">
            <div
              className="card p-4 text-center h-100"
              style={{
                border: "1px solid #d4af37",
              }}
            >
              <h4>🔗 Social Media</h4>

              <p className="text-secondary">
                Manage Instagram, Facebook, YouTube and WhatsApp links.
              </p>

              <button
                className="btn mt-auto"
                style={{
                  backgroundColor: "#d4af37",
                  color: "#000",
                }}
                disabled
              >
                Coming Soon
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
            onClick={() => navigate("/admin")}
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    </main>
  );
}

export default AdminTeam;
