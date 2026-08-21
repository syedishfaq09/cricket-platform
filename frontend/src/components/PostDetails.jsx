import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function PostDetails() {
  const { id } = useParams();

  const [post, setPost] = useState(null);

  const sharePost = async () => {
    const shareData = {
      title: "Alamdar Stars",
      text: post.caption,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Post link copied!");
      }
    } catch (error) {
      console.log("Sharing cancelled");
    }
  };

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/posts/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((error) => console.log(error));
  }, [id]);

  if (!post) {
    return (
      <main className="min-vh-100 py-5">
        <div className="container text-center">
          <h3>Loading post...</h3>
        </div>
      </main>
    );
  }

  return (
    <main className="min-vh-100 py-5">
      <div className="container">
        <div className="card p-4">
          {/* HEADER */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span
              className="badge rounded-pill"
              style={{
                backgroundColor: "#d4af37",
                color: "#171717",
                padding: "8px 14px",
              }}
            >
              📝 {post.category}
            </span>

            <small className="text-secondary">
              {new Date(post.createdAt).toLocaleDateString("en-IN")}
            </small>
          </div>

          {/* TITLE */}
          <h1 className="fw-bold mb-4">{post.caption}</h1>

          {/* MEDIA */}
          {post.media?.map((item, index) => (
            <div key={index} className="mb-4">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={post.caption}
                  className="img-fluid rounded"
                  style={{
                    width: "100%",
                    maxHeight: "650px",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <video src={item.url} controls className="w-100 rounded" />
              )}
            </div>
          ))}

          {/* MATCH DETAILS */}
          {post.match && (
            <div
              className="p-3 rounded mt-3"
              style={{
                backgroundColor: "#f1f2f4",
              }}
            >
              <h5>🏏 Match Information</h5>

              <p className="mb-1">Alamdar Stars vs {post.match.opponent}</p>

              <p className="mb-0 text-secondary">Venue: {post.match.venue}</p>
            </div>
          )}

          {/* PLAYER DETAILS */}
          {post.player && (
            <div
              className="p-3 rounded mt-3"
              style={{
                border: "1px solid #d4af37",
              }}
            >
              <h5>👤 Player</h5>

              <p className="mb-0">{post.player.name}</p>

              <small className="text-secondary">{post.player.role}</small>
            </div>
          )}

          {/* SHARE BUTTON */}

          <div className="mt-4">
            <button
              className="btn"
              style={{
                backgroundColor: "#d4af37",
                color: "#171717",
              }}
              onClick={sharePost}
            >
              🔗 Share Post
            </button>
          </div>

          {/* FOOTER */}

          <div className="text-secondary mt-3">
            Posted by {post.createdBy?.name || "Alamdar Stars"}
          </div>
        </div>
      </div>
    </main>
  );
}

export default PostDetails;
