import { useEffect, useState } from "react";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/announcements");

      const data = await response.json();

      if (response.ok) {
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-vh-100 py-5">
        <div className="container text-center">
          <h2>Loading announcements...</h2>
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
            ⭐ ALAMDAR STARS
          </h1>

          <h2 className="mt-3">Announcements</h2>

          <p className="text-secondary">
            Official team announcements and important updates
          </p>
        </div>

        {/* ANNOUNCEMENTS */}

        {announcements.length === 0 ? (
          <div className="card p-5 text-center">
            <div style={{ fontSize: "4rem" }}>📢</div>

            <h3 className="mt-3">No announcements yet</h3>

            <p className="text-secondary">
              Official team announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {announcements.map((announcement) => (
              <div className="col-12" key={announcement._id}>
                <div
                  className="card p-4"
                  style={{
                    border: "1px solid #d4af37",
                    borderRadius: "15px",
                  }}
                >
                  {/* DATE */}

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#d4af37",
                        color: "#000",
                      }}
                    >
                      📢 Announcement
                    </span>

                    <small className="text-secondary">
                      {new Date(announcement.createdAt).toLocaleDateString(
                        "en-IN",
                      )}
                    </small>
                  </div>

                  {/* TITLE */}

                  <h3 className="fw-bold">{announcement.title}</h3>

                  {/* CONTENT */}

                  <p
                    className="text-secondary mt-3 mb-3"
                    style={{
                      whiteSpace: "pre-wrap",
                      fontSize: "1.05rem",
                    }}
                  >
                    {announcement.content ||
                      announcement.message ||
                      announcement.description ||
                      announcement.body ||
                      announcement.text}
                  </p>

                  {/* AUTHOR */}

                  <div className="mt-3">
                    <small className="text-secondary">Posted by Admin</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Announcements;
