import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPosts() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");

  const user = storedUser ? JSON.parse(storedUser) : null;

  const [posts, setPosts] = useState([]);

  const [matches, setMatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  const [formData, setFormData] = useState({
    caption: "",
    category: "Other",
    match: "",
  });

  const [selectedFiles, setSelectedFiles] = useState(null);
  const [existingMedia, setExistingMedia] = useState([]);

  // ==========================================
  // SECURITY
  // ==========================================

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchData();
  }, []);

  // ==========================================
  // FETCH DATA
  // ==========================================

  const fetchData = async () => {
    try {
      setLoading(true);

      const [postsResponse, matchesResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/posts`),
        fetch(`${import.meta.env.VITE_API_URL}/api/matches`),
      ]);

      const postsData = await postsResponse.json();
      const matchesData = await matchesResponse.json();

      if (postsResponse.ok) {
        setPosts(postsData);
      }

      if (matchesResponse.ok) {
        setMatches(matchesData);
      }
    } catch (error) {
      console.error("Error loading admin posts:", error);

      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RESET FORM
  // ==========================================
  const resetForm = () => {
    setFormData({
      caption: "",
      category: "Other",
      match: "",
    });

    setSelectedFiles(null);

    setExistingMedia([]);

    setEditingPostId(null);
  };
  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // EDIT POST
  // ==========================================

  const handleEdit = (post) => {
    setFormData({
      caption: post.caption || "",
      category: post.category || "Other",
      match: post.match?._id || "",
    });

    setSelectedFiles(null);

    setExistingMedia(post.media || []);
    setEditingPostId(post._id);
    setShowForm(true);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // upload media

  const uploadMedia = async (file) => {
    const formData = new FormData();

    formData.append("media", file);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/upload/media`,
      {
        method: "POST",
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Media upload failed");
    }

    return {
      url: data.mediaUrl,
      type: data.type,
    };
  };

  // ==========================================
  // SAVE POST
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?._id) {
      setMessage("Admin account information not found.");
      return;
    }

    if (!formData.caption.trim()) {
      setMessage("Please enter a caption.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      let validMedia = [...existingMedia];

      if (selectedFiles) {
        const uploaded = await uploadMedia(selectedFiles);

        validMedia = [uploaded];
      }

      const isEditing = Boolean(editingPostId);

      const url = isEditing
        ? `${import.meta.env.VITE_API_URL}/api/posts/${editingPostId}`
        : `${import.meta.env.VITE_API_URL}/api/posts`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",

        headers: {
          "Content-Type": "application/json",
          "x-user-id": user._id,
        },

        body: JSON.stringify({
          caption: formData.caption.trim(),

          category: formData.category,

          match: formData.match || null,

          media: validMedia,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(
          isEditing
            ? "Post updated successfully."
            : "Post published successfully.",
        );

        resetForm();

        await fetchData();
      } else {
        setMessage(data.message || "Failed to save post.");
      }
    } catch (error) {
      console.error("Error saving post:", error);

      setMessage("Unable to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DELETE POST
  // ==========================================

  const handleDelete = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/posts/${postId}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": user._id,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Post deleted successfully.");
        fetchData();
      } else {
        setMessage(data.message || "Failed to delete post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);

      setMessage("Unable to connect to server.");
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-vh-100 py-5">
        <div className="container text-center">
          <h2>Loading posts...</h2>
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

          <h2 className="mt-3">📝 Manage Posts</h2>

          <p className="text-secondary">
            Create and manage team news, announcements and updates.
          </p>
        </div>

        {/* ADD BUTTON */}

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
            {showForm ? "✕ Close" : "+ Create Post"}
          </button>
        </div>

        {/* MESSAGE */}

        {message && (
          <div className="alert alert-info text-center">{message}</div>
        )}

        {/* FORM */}

        {showForm && (
          <div className="card p-4 mb-5">
            <div className="text-center mb-4">
              <h3 className="fw-bold">
                {editingPostId ? "Edit Post" : "Create New Post"}
              </h3>

              <p className="text-secondary">
                Share the latest Alamdar Stars news.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* CAPTION */}

              <div className="mb-3">
                <label className="form-label">Caption *</label>

                <textarea
                  name="caption"
                  className="form-control"
                  rows="4"
                  placeholder="Example: BIG WIN FOR ALAMDAR STARS!..."
                  value={formData.caption}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* CATEGORY */}

              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Category</label>

                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="Match">Match</option>
                    <option value="Victory">Victory</option>
                    <option value="Training">Training</option>
                    <option value="Player">Player</option>
                    <option value="Announcement">Announcement</option>
                    <option value="Celebration">Celebration</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* MATCH */}

                <div className="col-md-4">
                  <label className="form-label">Related Match</label>

                  <select
                    name="match"
                    className="form-select"
                    value={formData.match}
                    onChange={handleChange}
                  >
                    <option value="">No Match</option>

                    {matches.map((match) => (
                      <option key={match._id} value={match._id}>
                        vs {match.opponent} -{" "}
                        {new Date(match.date).toLocaleDateString("en-IN")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* MEDIA */}

              <div className="mt-4">
                <label className="form-label">Photos / Videos</label>

                <input
                  type="file"
                  className="form-control"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    const file = e.target.files[0];

                    setSelectedFiles(file);
                  }}
                />

                {selectedFiles && selectedFiles.name && (
                  <div className="mt-3 text-secondary">
                    Selected: {selectedFiles.name}
                  </div>
                )}

                {existingMedia.length > 0 && (
                  <div className="mt-3">
                    <p className="text-secondary">Current Media:</p>

                    {existingMedia[0].type === "image" ? (
                      <img
                        src={existingMedia[0].url}
                        alt="Current"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    ) : (
                      <video
                        src={existingMedia[0].url}
                        controls
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* BUTTONS */}

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
                    : editingPostId
                      ? "Update Post"
                      : "Publish Post"}
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

        {/* POSTS */}

        {posts.length === 0 ? (
          <div className="card text-center p-5">
            <div style={{ fontSize: "4rem" }}>📝</div>

            <h3 className="mt-3">No Posts Yet</h3>

            <p className="text-secondary">
              Create your first Alamdar Stars post.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {posts.map((post) => (
              <div className="col-lg-6" key={post._id}>
                <div className="card h-100 p-4">
                  <div className="d-flex justify-content-between mb-3">
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: "#d4af37",
                        color: "#000",
                      }}
                    >
                      {post.category}
                    </span>

                    <small className="text-secondary">
                      {new Date(post.createdAt).toLocaleDateString("en-IN")}
                    </small>
                  </div>

                  <h4 className="fw-bold">{post.caption}</h4>

                  {post.media?.length > 0 && (
                    <div className="row g-2 mt-2">
                      {post.media.map((item, index) => (
                        <div className="col-6" key={index}>
                          {item.type === "image" ? (
                            <img
                              src={item.url}
                              alt=""
                              className="img-fluid rounded"
                              style={{
                                height: "180px",
                                width: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <video
                              src={item.url}
                              controls
                              className="w-100 rounded"
                              style={{
                                height: "180px",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {post.match && (
                    <p className="text-secondary mt-3 mb-1">
                      🏏 vs {post.match.opponent}
                    </p>
                  )}

                  <div className="d-flex gap-2 mt-4">
                    <button
                      className="btn btn-outline-secondary flex-fill"
                      onClick={() => handleEdit(post)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-outline-danger flex-fill"
                      onClick={() => handleDelete(post._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

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

export default AdminPosts;
