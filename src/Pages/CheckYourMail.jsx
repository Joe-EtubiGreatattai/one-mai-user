import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import Logo from "../assets/MAI.png";

const CheckYourMail = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6">
      {/* Logo - Optional (uncomment if you want to add it) */}
      {/* <div className="mb-6 sm:mb-8">
        <img src={Logo} alt="MAI Logo" className="h-10 sm:h-12" />
      </div> */}

      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
          {/* Mail Icon */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="bg-indigo-100 p-3 sm:p-4 rounded-full">
              <FiMail className="text-indigo-600 text-3xl sm:text-4xl" />
            </div>
          </div>

          {/* Heading and Description */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Check your mail
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              We've sent a password reset link to your registered email address
            </p>
          </div>

          {/* Additional Info */}
          <div className="mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-gray-500 italic">
              Open your mailbox app to find the password reset link
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <Link
              to="/signin"
              className="w-full py-2 sm:py-3 px-4 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center transition-colors"
            >
              Back to Sign In
            </Link>

            <p className="text-xs sm:text-sm text-gray-500">
              Didn't receive the email?{' '}
              <button className="text-indigo-600 hover:text-indigo-500 font-medium focus:outline-none">
                Resend
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Optional Footer */}
      <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-gray-500">
        Need help? <Link to="/contact" className="text-indigo-600 hover:text-indigo-500">Contact support</Link>
      </div>
    </div>
  );
};

export default CheckYourMail;