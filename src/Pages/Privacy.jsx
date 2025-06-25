import React, { useRef, useEffect } from "react";

const Privacy = () => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        <div className="bg-[#00182b] text-white px-6 py-4">
          <h1 className="text-2xl font-semibold">Privacy Policy</h1>
          <p className="text-sm text-gray-300">Last updated: June 2024</p>
        </div>

        <div
          ref={scrollRef}
          className="overflow-y-auto h-[75vh] px-6 py-6 text-sm text-gray-700 space-y-6"
        >
          <section>
            <h2 className="text-lg font-semibold mb-1">1. Introduction</h2>
            <p>
              Welcome to Tee-Mai Users. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Personal Data:</strong> Name, email address, and other contact information you provide when registering or contacting us.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our website, such as IP address, browser type, and pages visited.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies to enhance your experience and analyze site usage.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide and maintain our services</li>
              <li>To communicate with you</li>
              <li>To improve our website and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">4. Sharing Your Information</h2>
            <p>
              We do not sell or rent your personal information. We may share information with service providers who assist us in operating the website, or if required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">5. Security</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">6. Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information. To exercise these rights, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-1">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:support@tee-mai.com" className="text-blue-600 underline">
                support@tee-mai.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
