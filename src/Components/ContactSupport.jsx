// ContactSupport.jsx
import React from "react";
import { Link } from "react-router-dom";

const ContactSupport = () => {
    return (
        <div className="bg-[#f9f9f9] p-6 rounded-lg shadow-md border border-gray-200 text-center">
            <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
                Reach out to our support team if you're experiencing issues or need assistance.
            </p>
            <a
                href="mailto:support@example.com"
                className="inline-block px-5 py-2 bg-[#3390d5] text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
            >
                Contact Support
            </a>
        </div>
    );
};

export default ContactSupport;
