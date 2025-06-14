import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AccountTypeSelection = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
      },
    },
    hover: {
      y: -10,
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    },
  };

  const handleSelectAccountType = (type) => {
    if (type === "affiliate") {
      navigate("/affilator-create-account");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-12"
      >
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">
          Join Our Community
        </h1>
        <p className="text-sm sm:text-lg text-gray-600 max-w-md">
          Choose the account type that fits your needs and start your journey
          with us today.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8 w-full max-w-4xl"
      >
        {/* Standard Account Card */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          onClick={() => handleSelectAccountType("normal")}
          className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 flex-1 cursor-pointer border-2 border-transparent hover:border-blue-500 transition-all"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className="bg-blue-100 p-3 sm:p-4 rounded-full mb-4 sm:mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">
              Normal User Account
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 flex-grow">
              Perfect for individuals who want to join groups, save money, and
              collaborate with friends.
            </p>
            <ul className="text-left w-full space-y-1 sm:space-y-2 mb-4 sm:mb-8 text-sm sm:text-base text-gray-700">
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Join unlimited groups
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Create savings plans
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Chat with group members
              </li>
            </ul>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors"
            >
              Get Started
            </motion.button>
          </div>
        </motion.div>

        {/* Affiliate Account Card */}
        <motion.div
          variants={cardVariants}
          whileHover="hover"
          onClick={() => handleSelectAccountType("affiliate")}
          className="bg-white rounded-xl p-4 sm:p-6 lg:p-8 flex-1 cursor-pointer border-2 border-transparent hover:border-purple-500 transition-all mt-4 sm:mt-0"
        >
          <div className="flex flex-col items-center text-center h-full">
            <div className="bg-purple-100 p-3 sm:p-4 rounded-full mb-4 sm:mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-3">
              Affiliate Account
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 flex-grow">
              For partners who want to earn commissions by referring users to our
              platform.
            </p>
            <ul className="text-left w-full space-y-1 sm:space-y-2 mb-4 sm:mb-8 text-sm sm:text-base text-gray-700">
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Earn commission on referrals
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Access to affiliate dashboard
              </li>
              <li className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                All standard account features
              </li>
            </ul>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full py-2 sm:py-3 px-4 sm:px-6 bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors"
            >
              Become an Affiliate
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 sm:mt-12 text-center"
      >
        <p className="text-sm sm:text-base text-gray-600">
          Already have an account?{" "}
          <button
            onClick={() => navigate("/signIn")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AccountTypeSelection;