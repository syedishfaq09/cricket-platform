import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminAnnouncements() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [announcements, setAnnouncements] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcements`,
      );

      const data = await response.json();

      if (response.ok) {
        setAnnouncements(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcements`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-user-id": user._id,
          },

          body: JSON.stringify({
            title,
            description,
            category: "Announcement",
          }),
        },
      );

      if (response.ok) {
        setMessage("Announcement published successfully");

        setTitle("");
        setDescription("");

        fetchAnnouncements();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deleteAnnouncement = async (id) => {
    const confirmDelete = window.confirm("Delete announcement?");

    if (!confirmDelete) return;

    await fetch(`${import.meta.env.VITE_API_URL}/api/announcements/${id}`, {
      method: "DELETE",
    });

    fetchAnnouncements();
  };

  if (loading) {
    return <h2 className="text-center mt-5">Loading announcements...</h2>;
  }

  return (
    <main className="min-vh-100 py-5">
      <div className="container">
        <div className="text-center mb-5">
          <h1 className="fw-bold" style={{ color: "#d4af37" }}>
            ⭐ ALAMDAR STARS
          </h1>

          <h2>📢 Manage Announcements</h2>

          <p className="text-secondary">
            Official team announcements and updates
          </p>
        </div>

        {message && <div className="alert alert-success">{message}</div>}

        <div className="card p-4 mb-5">
          <form onSubmit={createAnnouncement}>
            <input
              className="form-control mb-3"
              placeholder="Announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="form-control mb-3"
              rows="5"
              placeholder="Write announcement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <button
              className="btn"
              style={{
                background: "#d4af37",
              }}
            >
              Publish Announcement
            </button>
          </form>
        </div>

        {announcements.map((item) => (
          <div className="card p-4 mb-3" key={item._id}>
            <h3>{item.title}</h3>

            <p>{item.description}</p>

            <small>Posted by {item.createdBy}</small>

            <br />

            <button
              className="btn btn-danger mt-3"
              onClick={() => deleteAnnouncement(item._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default AdminAnnouncements;
