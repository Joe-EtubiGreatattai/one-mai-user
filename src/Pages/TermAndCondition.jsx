import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TermAndCondition = () => {
  const [isBottom, setIsBottom] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const handleScroll = () => {
    const container = scrollRef.current;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 20) {
      setIsBottom(true);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleAccept = () => {
    navigate(-1); // goes back to the previous page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="bg-[#00182b] text-white px-6 py-4">
          <h1 className="text-2xl font-semibold">Terms and Conditions</h1>
          <p className="text-sm text-gray-300">Last updated: June 2024</p>
        </div>

        <div
          ref={scrollRef}
          className="overflow-y-auto h-[70vh] px-6 py-4 space-y-5 text-sm text-gray-700"
        >
          <section>
            <h2 className="font-semibold text-lg mb-1">1. Acceptance of Terms</h2>
            <p>
              By accessing or using this website, you agree to be bound by these Terms and Conditions and our Privacy Policy.
              If you do not agree with any part of these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">2. Use of the Service</h2>
            <p>
              You agree to use the website only for lawful purposes and in a way that does not infringe the rights of,
              restrict, or inhibit anyone else's use of the website.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">3. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, and intellectual property displayed on this website are the property of
              their respective owners. You may not reproduce, distribute, or create derivative works without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">4. User Accounts</h2>
            <p>
              If you create an account, you are responsible for maintaining the confidentiality of your account and password
              and for restricting access to your computer.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">5. Limitation of Liability</h2>
            <p>
              We are not liable for any damages or losses resulting from your use of this website or any content, services,
              or products obtained through it.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">6. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites. We are not responsible for the content or privacy
              practices of those sites.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your access to the website at our sole discretion, without notice,
              for conduct that we believe violates these Terms.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">8. Changes to Terms</h2>
            <p>
              We may update these Terms and Conditions from time to time. Continued use of the website after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">9. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-lg mb-1">10. Contact Us</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at support@example.com.
            </p>
          </section>
        </div>

        <div className="border-t px-6 py-4 bg-gray-50">
          <button
            onClick={handleAccept}
            disabled={!isBottom}
            className={`w-full py-2 px-4 text-white rounded-md transition-colors duration-200 ${
              isBottom ? "bg-[#3390d5] hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isBottom ? "I Agree and Continue" : "Scroll to bottom to accept"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermAndCondition;
