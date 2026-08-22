import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Tracks whether each image should be shown with object-fit: cover
  // or object-fit: contain, decided once the image loads (see
  // handleImageLoad below).
  const [imageFit, setImageFit] = useState({});

  // Tracks which slide is active for posts with more than one media
  // item, so we can show an Instagram-style dot indicator.
  const [activeSlide, setActiveSlide] = useState({});

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts`);

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

  // Decide how a given image should fit its 4:5 frame based on its
  // natural aspect ratio. Portrait / near-square / full-body shots
  // (most player and match photos) crop nicely with "cover" and stay
  // filled edge-to-edge. Clearly wide/landscape images would lose
  // important content (banners, faces, trophies) if force-cropped to
  // 4:5, so those fall back to "contain" instead of cutting them off.
  const handleImageLoad = (key, event) => {
    const { naturalWidth, naturalHeight } = event.target;

    if (!naturalWidth || !naturalHeight) {
      return;
    }

    const ratio = naturalWidth / naturalHeight;

    setImageFit((prev) => ({
      ...prev,
      [key]: ratio > 1.15 ? "contain" : "cover",
    }));
  };

  const handleMediaScroll = (postId, event) => {
    const { scrollLeft, clientWidth } = event.currentTarget;

    if (!clientWidth) {
      return;
    }

    const index = Math.round(scrollLeft / clientWidth);

    setActiveSlide((prev) =>
      prev[postId] === index ? prev : { ...prev, [postId]: index },
    );
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
          <div className="ig-feed">
            {posts.map((post) => {
              const mediaCount = post.media?.length || 0;
              const currentSlide = activeSlide[post._id] || 0;

              return (
                <article
                  className="ig-post-card"
                  key={post._id}
                  onClick={() => navigate(`/posts/${post._id}`)}
                >
                  {/* CATEGORY + DATE */}
                  <div className="ig-post-topbar">
                    <span className="ig-post-badge">
                      {getCategoryIcon(post.category)} {post.category}
                    </span>

                    <span className="ig-post-date">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  {/* CAPTION */}
                  <h3 className="ig-post-title">{post.caption}</h3>

                  {/* MEDIA */}
                  {mediaCount > 0 && (
                    <div className="ig-post-media">
                      <div
                        className="ig-post-media-track"
                        onScroll={
                          mediaCount > 1
                            ? (event) => handleMediaScroll(post._id, event)
                            : undefined
                        }
                        // Prevent a swipe between multiple photos from
                        // also registering as a "open post" tap, while
                        // leaving single-image posts fully clickable
                        // exactly as before.
                        onClick={
                          mediaCount > 1
                            ? (event) => event.stopPropagation()
                            : undefined
                        }
                      >
                        {post.media.map((media, index) => {
                          const mediaKey = `${post._id}-${index}`;
                          const fit = imageFit[mediaKey] || "cover";

                          return (
                            <div className="ig-post-slide" key={mediaKey}>
                              {media.type === "image" ? (
                                <img
                                  src={media.url}
                                  alt={post.caption}
                                  className={`ig-post-image ig-fit-${fit}`}
                                  loading="lazy"
                                  onLoad={(event) =>
                                    handleImageLoad(mediaKey, event)
                                  }
                                />
                              ) : (
                                <video
                                  src={media.url}
                                  controls
                                  className="ig-post-video"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {mediaCount > 1 && (
                        <div className="ig-post-dots">
                          {post.media.map((_, index) => (
                            <span
                              key={index}
                              className={`ig-post-dot ${
                                currentSlide === index ? "active" : ""
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* MATCH */}
                  {post.match && (
                    <div className="ig-post-match">
                      🏏 <strong>Match:</strong> Alamdar Stars vs{" "}
                      {post.match.opponent}
                    </div>
                  )}

                  {/* PLAYER */}
                  {post.player && (
                    <div className="ig-post-player">
                      {post.player.photo ? (
                        <img
                          src={post.player.photo}
                          alt={post.player.name}
                          className="ig-post-player-photo"
                        />
                      ) : (
                        <div className="ig-post-player-icon">👤</div>
                      )}

                      <div>
                        <strong>{post.player.name}</strong>

                        {post.player.role && (
                          <div className="ig-post-player-role">
                            {post.player.role}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* CREATED BY */}
                  <div className="ig-post-footer">
                    Posted by {post.createdBy?.name || "Alamdar Stars"}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Posts;
