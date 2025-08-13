import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import Image1 from "../assets/0.png";
import Image2 from "../assets/1.png";
import Image3 from "../assets/2.png";
import Image4 from "../assets/3.png";
import useAuthStore from "../Store/Auth";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { verifySignup, loading, error, clearError, resendOtp } =
    useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Get signup data from navigation state
  const signupData = location.state?.signupData;

  useEffect(() => {
    if (!signupData) {
      navigate("/signup");
    }
  }, [signupData, navigate]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        setCanResend(true);
        clearInterval(timer);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`).focus();
    }

    if (value && index === 3) {
      document.getElementById("verify-button").click();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain").trim();
    if (!/^\d{4}$/.test(pasteData)) return;

    const pastedOtp = pasteData.split("").slice(0, 4);
    setOtp(pastedOtp);

    // Focus on the last input after paste
    document.getElementById(`otp-3`).focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    if (otp.join("").length !== 4) return;

    try {
      await verifySignup({
        ...signupData,
        otp: otp.join(""),
      });
      navigate("/create-pin");
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtp(["", "", "", ""]);
      document.getElementById("otp-0").focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    clearError();
    try {
      await resendOtp(signupData.email);
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", ""]);
      document.getElementById("otp-0").focus();
    } catch (error) {
      console.error("Resend OTP error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 sm:bg-gray-50 flex flex-col items-center justify-center px-4 py-14 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-left sm:text-center">
            <h2 className="text-2xl max-sm:text-start sm:text-3xl font-semibold sm:font-bold text-gray-900 mb-1 sm:mb-2">
              OTP Verification
            </h2>
            <p className="text-base sm:text-lg max-sm:text-start max-sm:text-sm text-gray-500">
              Please type the verification code sent to your email
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="sm:bg-white sm:p-8 rounded-lg sm:shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="flex justify-center space-x-2 sm:space-x-3">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={otp[index]}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : null}
                    autoFocus={index === 0}
                    ref={(el) => (otpRefs.current[index] = el)}
                    className="w-16 h-16 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl font-semibold border border-gray-300 rounded-md 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Didn't receive OTP code?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="font-medium text-[#3390d5] hover:text-[#3390d5] cursor-pointer"
                    >
                      Resend
                    </button>
                  ) : (
                    <span className="text-gray-400">
                      Resend code in {countdown} seconds
                    </span>
                  )}
                </p>
              </div>

              <button
                id="verify-button"
                type="submit"
                disabled={loading || otp.join("").length !== 4}
                className={`max-sm:mt-4 w-full py-2 px-4 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                  loading
                    ? "bg-[#3390d5] cursor-not-allowed"
                    : "bg-[#3390d5] hover:bg-blue-700"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify Code"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column - Full Screen Carousel */}
      <div className="hidden md:block md:w-1/2 relative">
        <div className="h-screen w-full">
          <Carousel
            autoPlay
            infiniteLoop
            showThumbs={false}
            showStatus={false}
            showIndicators={false}
            showArrows={false}
            interval={5000}
            transitionTime={800}
            swipeable
            emulateTouch
            className="h-full"
          >
            {[Image1, Image2, Image3, Image4].map((src, idx) => (
              <div key={idx} className="h-screen relative">
                <img
                  src={src}
                  alt={`Slide ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;