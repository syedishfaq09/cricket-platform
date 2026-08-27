import React from "react";

/**
 * DeveloperCredit
 * Small fixed badge shown at the bottom-left of every page,
 * opposite the "Powered by Netlify" badge (bottom-right).
 * Pure visual credit — no links, no clicks, no side effects.
 */
function DeveloperCredit() {
  return (
    <div className="developer-credit-badge" aria-hidden="false">
      <span className="developer-credit-icon">⚙</span>
      <span className="developer-credit-text">Developed by Syed Ishfaq</span>
    </div>
  );
}

export default DeveloperCredit;
