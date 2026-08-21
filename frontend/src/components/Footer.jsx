import React from "react";

function Footer() {
  return (
    <footer className="alamdar-footer">
      <div className="container">
        {/* ==========================================
            MAIN FOOTER CONTENT
        ========================================== */}

        <div className="row gy-5 align-items-start">
          {/* ==========================================
              ALAMDAR STARS
          ========================================== */}

          <div className="col-lg-4">
            <div className="footer-brand">
              ⭐ <span>ALAMDAR STARS MASHWARA</span>
            </div>

            <p className="footer-tagline">One Team, One Dream</p>

            <p className="footer-description">
              The official website of Alamdar Stars Mashwara
              <br className="d-none d-md-block" />
              cricket team.
            </p>
          </div>

          {/* ==========================================
              CONTACT
          ========================================== */}

          <div className="col-lg-5">
            <div className="footer-section-title">CONTACT</div>

            <div className="footer-contact-wrapper">
              {/* CAPTAIN */}

              <div className="footer-contact-person">
                <div className="footer-contact-role">
                  <span className="footer-person-icon">♙</span>
                  CAPTAIN
                </div>

                <div className="footer-contact-name">Syed Asif</div>

                <a
                  href="https://wa.me/917889703332"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-whatsapp"
                >
                  <span className="footer-whatsapp-icon">◉</span>
                  WhatsApp
                </a>

                <div className="footer-phone">7889703332</div>
              </div>

              {/* DIVIDER */}

              <div className="footer-contact-divider"></div>

              {/* ADMIN */}

              <div className="footer-contact-person">
                <div className="footer-contact-role">
                  <span className="footer-person-icon">♙</span>
                  ADMIN
                </div>

                <div className="footer-contact-name">Syed Sajad</div>

                <a
                  href="https://wa.me/919797979350"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-whatsapp"
                >
                  <span className="footer-whatsapp-icon">◉</span>
                  WhatsApp
                </a>

                <div className="footer-phone">9797979350</div>
              </div>
            </div>
          </div>

          {/* ==========================================
              SOCIAL MEDIA
          ========================================== */}

          <div className="col-lg-3">
            <div className="footer-section-title">
              FOLLOW ALAMDAR STARS MASHWARA
            </div>

            <div className="footer-social-links">
              <a
                href="https://www.facebook.com/people/Alamdar-STARS-Mashwara/61591376602047/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <span className="footer-social-icon facebook-icon">f</span>

                <span>Facebook</span>

                <span className="footer-external-icon">↗</span>
              </a>

              <a
                href="https://www.instagram.com/alamdar_stars_mashwara/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link"
              >
                <span className="footer-social-icon instagram-icon">◎</span>

                <span>Instagram</span>

                <span className="footer-external-icon">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* ==========================================
            CAPTAIN'S MESSAGE
        ========================================== */}

        <div className="footer-message-section">
          <div className="footer-message-line"></div>

          <div className="footer-message-content">
            <div className="footer-message-title">CAPTAIN'S MESSAGE</div>

            <div className="footer-message-star">★</div>

            <p className="footer-message-text">
              One Team, One Dream.
              <br />
              We Do Not Play Games To Win Trophies,We Leave Behind A Legacy For
              Future Generations
            </p>
          </div>
        </div>

        {/* ==========================================
            COPYRIGHT
        ========================================== */}

        <div className="footer-copyright">
          © {new Date().getFullYear()} Alamdar Stars Mashwara.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
