import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/posts");

      const data = await response.json();

      if (response.ok) {
        setPosts(data);
      } else {
        setMessage(data.message || "Unable to load posts.");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setMessage("Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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

  const getCategoryIcon = (category) => {
    const icons = {
      Match: "🏏",
      Victory: "🏆",
      Training: "💪",
      Player: "👤",
      Announcement: "📢",
      Celebration: "🎉",
      Other: "📝",
    };

    return icons[category] || "📝";
  };

  if (loading) {
    return (
      <main className="min-vh-100 py-5">
        <div className="container text-center">
          <h2>Loading posts...</h2>
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
              fontSize: "3rem",
            }}
          >
            ⭐ ALAMDAR STARS
          </h1>

          <h2 className="mt-3">Latest News</h2>

          <p className="text-secondary">
            Latest updates, victories and announcements from the team.
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="alert alert-danger text-center">{message}</div>
        )}

        {/* NO POSTS */}
        {posts.length === 0 ? (
          <div className="card text-center p-5">
            <div style={{ fontSize: "4rem" }}>📝</div>

            <h3 className="mt-3">No Posts Yet</h3>

            <p className="text-secondary mb-0">
              Team news and updates will appear here.
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {posts.map((post) => (
              <div className="col-lg-8 mx-auto" key={post._id}>
                <div
                  className="card p-4"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  {/* CATEGORY */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span
                      className="badge rounded-pill"
                      style={{
                        backgroundColor: "#d4af37",
                        color: "#171717",
                        padding: "8px 14px",
                      }}
                    >
                      {getCategoryIcon(post.category)} {post.category}
                    </span>

                    <small className="text-secondary">
                      {formatDate(post.createdAt)}
                    </small>
                  </div>

                  {/* CAPTION */}
                  <h3 className="fw-bold">{post.caption}</h3>

                  {/* MEDIA */}
                  {post.media?.length > 0 && (
                    <div className="row g-2 mt-2">
                      {post.media.map((media, index) => (
                        <div className="col-md-6" key={`${post._id}-${index}`}>
                          {media.type === "image" ? (
                            <img
                              src={media.url}
                              alt={post.caption}
                              className="img-fluid rounded"
                              style={{
                                width: "100%",
                                height: "280px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <video
                              src={media.url}
                              controls
                              className="w-100 rounded"
                              style={{
                                height: "280px",
                                objectFit: "cover",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* MATCH */}
                  {post.match && (
                    <div
                      className="mt-3 p-3 rounded"
                      style={{
                        backgroundColor: "#f1f2f4",
                      }}
                    >
                      🏏 <strong>Match:</strong> Alamdar Stars vs{" "}
                      {post.match.opponent}
                    </div>
                  )}

                  {/* PLAYER */}
                  {post.player && (
                    <div
                      className="mt-3 p-3 rounded d-flex align-items-center"
                      style={{
                        backgroundColor: "#fffaf0",
                        border: "1px solid #d4af37",
                      }}
                    >
                      {post.player.photo ? (
                        <img
                          src={post.player.photo}
                          alt={post.player.name}
                          style={{
                            width: "55px",
                            height: "55px",
                            objectFit: "cover",
                            borderRadius: "50%",
                            marginRight: "15px",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            fontSize: "2rem",
                            marginRight: "15px",
                          }}
                        >
                          👤
                        </div>
                      )}

                      <div>
                        <strong>{post.player.name}</strong>

                        {post.player.role && (
                          <div className="text-secondary">
                            {post.player.role}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CREATED BY */}
                  <div className="text-secondary mt-3">
                    Posted by {post.createdBy?.name || "Alamdar Stars"}
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

export default Posts;
