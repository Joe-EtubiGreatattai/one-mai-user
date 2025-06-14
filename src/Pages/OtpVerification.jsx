import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Family from "../assets/Family.jpeg";
import useAuthStore from "../Store/Auth";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60); // Changed to 60 seconds for better UX
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
    if (!/^\d{6}$/.test(pasteData)) return;

    const pastedOtp = pasteData.split("").slice(0, 6);
    setOtp(pastedOtp);

    // Focus on the last input after paste
    document.getElementById(`otp-5`).focus();
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
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0").focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    clearError();
    try {
      await resendOtp(
        // phone: signupData.phoneNumber,
        signupData.email
      );
      setCountdown(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      document.getElementById("otp-0").focus();
    } catch (error) {
      console.error("Resend OTP error:", error);
    }
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "";
    // Format phone number for display (e.g., +1 (234) 567-8901)
    return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, "$1 ($2) $3-$4");
  };

  return (
    <div className="h-dvh flex flex-col md:flex-row overflow-hidden bg-white relative">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex flex-col p-4 sm:p-6 h-full flex-center">
        <div className="w-full max-w-md ">
          <div className="mb-4 sm:mb-6 text-center">
            <h2 className="text-2xl font-semibold text-[#2E2E2E]">
              OTP Verification
            </h2>
            <p className="text-[#9A9A9A] font-normal mt-2 text-sm">
              Please type the verification code sent to your email
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div>
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
                    onPaste={index === 0 ? handlePaste : null} // Only attach paste handler to first input
                    autoFocus={index === 0}
                    ref={(el) => (otpRefs.current[index] = el)}
                    className="w-16 h-18 sm:w-16 sm:h-18 text-center text-xl sm:text-2xl font-semibold border border-[#F3F4F6] rounded-md 
                              focus:outline-none bg-[#F9FAFB] focus:ring-2 focus:ring-[#3390D5] focus:border-[#3390D5]"
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="text-[#9A9A9A] text-sm font-normal">
                  Didnt Receive OTP code ?
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-[#3390D5] hover:underline cursor-pointer"
                    >
                      Resend
                    </button>
                  ) : (
                    `Resend code in ${countdown} seconds`
                  )}
                </p>
              </div>
              <button
                id="verify-button"
                type="submit"
                disabled={loading || otp.join("").length !== 4}
                className={`cursor-pointer w-full mt-6 py-2 sm:py-2 px-4 text-white text-base sm:text-lg font-medium rounded-md transition-colors bg-[#3390D5]`}
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

      {/* Right side - Image (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 relative bg-blue-900">
        <img
          src={Family}
          alt="Family enjoying savings"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-[#00182b] opacity-40"></div>
        <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-8">
          <div className="max-w-md mx-auto text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
              Welcome to MAI Savings
            </h2>
            <p className="text-base sm:text-lg mb-4 sm:mb-6">
              Join forces with friends and family to save for your dreams!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
