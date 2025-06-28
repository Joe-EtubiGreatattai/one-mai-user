import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("en");

  const handleContactSupport = () => {
    console.log("Contact support clicked");
    navigate("/support");
  };

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    console.log("Language selected:", selectedLang);
    // Optional: Save to localStorage or context
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg,rgba(52, 145, 213, 1) 40%, rgba(1, 29, 79, 1) 100%)",
          height: "100%",
          width: "100%",
        }}
      />

      {/* Language Selector + Contact Support */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center space-x-3 sm:space-x-4">
        {/* Language Dropdown */}
        <select
          value={language}
          onChange={handleLanguageChange}
          className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 sm:p-2.5 rounded-full text-sm sm:text-base shadow-lg hover:bg-white/20 transition-all duration-200 cursor-pointer"
        >
          <option value="en">English</option>
          <option value="pt">Portuguese</option>
          <option value="fr">French</option>
          <option value="es">Spanish</option>
        </select>

        {/* Contact Support Button */}
        <button
          onClick={handleContactSupport}
          className="bg-white/10 backdrop-blur-sm border border-white/20 
            rounded-full p-3 sm:p-4 
            text-white hover:bg-white/20 transition-all duration-200
            shadow-lg hover:shadow-xl active:scale-95
            flex items-center justify-center group"
          title="Contact Support"
        >
          <svg 
            className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </button>
      </div>

      {/* ...Rest of your code (unchanged)... */}

      {/* Desktop Content */}
      <div className="relative z-10 w-full max-w-[985px] mx-auto hidden md:flex gap-8 items-center justify-center flex-col">
        <h1 className="text-4xl md:text-[62px] font-normal text-white mb-3 sm:mb-4 md:mb-2 text-center">
          A community Approach to Saving for all Pocket Sizes
        </h1>
        <div className="flex items-center justify-center flex-col gap-8">
          <button
            className="h-12 flex items-center justify-center p-4 px-28 rounded-sm font-semibold text-[15px] text-[#1F2937] 
                      text-base sm:text-lg bg-white transition-all 
                      shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Create Account
          </button>

          <div className="flex items-center space-x-2">
            <p className="text-gray-200 text-sm sm:text-base">
              Already have an account?
            </p>
            <button
              className="text-white hover:text-gray-300 font-medium underline transition-colors text-sm sm:text-base"
              onClick={() => navigate("/signin")}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="pt-52 pb-16 h-dvh relative block md:hidden">
        <div className="h-2 rounded-full bg-white min-w-36 absolute bottom-2 left-1/2 -translate-x-1/2"></div>
        <div
          className="absolute bottom-1/3 left-1/2 w-[442px] h-[665px] rounded-[90px] opacity-30"
          style={{
            borderColor: "#fff",
            borderWidth: "2px",
            borderStyle: "solid",
          }}
        ></div>
        <div
          className="absolute top-28 right-10 w-[442px] h-[665px] rounded-[90px] opacity-30"
          style={{
            borderColor: "#fff",
            borderWidth: "2px",
            borderStyle: "solid",
          }}
        ></div>

        <div className="relative z-10 flex justify-between flex-col h-full">
          <h1 className="text-4xl md:text-[52px] font-normal text-white mb-3 sm:mb-4 md:mb-6 w-[300px]">
            A community Approach to Saving for all Pocket Sizes
          </h1>

          <div className="flex flex-col gap-2 w-full items-center justify-center">
            <button
              className="h-12 w-full flex items-center justify-center p-4 rounded-sm font-bold text-[#1F2937] 
                      text-base sm:text-lg bg-white transition-all 
                      shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              onClick={() => navigate("/signup")}
            >
              Create Account
            </button>

            <div className="flex items-center space-x-2">
              <p className="text-gray-200 text-sm sm:text-base">
                Already have an account?
              </p>
              <button
                className="text-white hover:text-gray-300 font-medium underline transition-colors text-sm sm:text-base"
                onClick={() => navigate("/signin")}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
