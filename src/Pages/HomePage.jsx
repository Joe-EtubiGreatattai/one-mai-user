import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

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

      {/* Content Container  md*/}
      <div className="relative z-10 w-full max-w-[985px] mx-auto hidden md:flex gap-8 items-center justify-center flex-col">
        {/* Text Content */}
        <h1 className="text-4xl md:text-[62px] font-normal text-white mb-3 sm:mb-4 md:mb-2 text-center">
          A community Approach to Saving for all Pocket Sizes
        </h1>

        {/* Action Buttons */}
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

      {/* Content Container  sm*/}
      <div className="pt-52 pb-16 h-dvh relative block md:hidden">
        {/* bottom bar */}
        <div className="h-2 rounded-full bg-white min-w-36 absolute bottom-2 left-1/2 -translate-1/2"></div>

        {/* rounded border boxes */}
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

        {/* main content */}
        <div className="relative z-10 flex justify-between flex-col h-full">
          {/* Text Content */}
          <h1 className="text-4xl md:text-[52px] font-normal text-white mb-3 sm:mb-4 md:mb-6 w-[300px]">
            A community Approach to Saving for all Pocket Sizes
          </h1>

          {/* Action Buttons */}
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
