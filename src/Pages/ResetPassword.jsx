import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/MAI.png";
import useAuthStore from "../Store/Auth";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { createPortal } from "react-dom";

const ResetPassword = () => {
  const { resendOtp, loading, error, clearError, resetPassword } =
    useAuthStore();
  const [email, setEmail] = React.useState("");
  const navigate = useNavigate();
  const [stepNum, setStepNum] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await resendOtp(email, "password_reset");
      // Optionally navigate to OTP verification page if needed
      setStepNum(2);

      // navigate("/verify-otp"); // if using react-router
    } catch (err) {
      console.error("Password reset request failed", err);
    }
  };

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

  const handleSubmitResetPassword = async (e) => {
    e.preventDefault();
    clearError();
    if (otp.join("").length !== 4) return;
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      await resetPassword({
        email,
        otp: otp.join(""),
        newPassword: password,
      });
      // await verifySignup({
      //   ...signupData,
      //   otp: otp.join(""),
      // });
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/signin");
        setShowSuccess(false);
      }, 2500);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-8 sm:p-6">
      <div className="w-full max-w-md mx-auto">
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src={Logo}
            alt="MAI Logo"
            className="h-12 sm:h-16"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/64";
            }}
          />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8">
          {stepNum == 1 ? (
            <>
              <div className="mb-6 sm:mb-8 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Reset Password
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Please enter your email address to receive an OTP
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    // pattern="^\+?\d{10,15}$"
                    placeholder=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 sm:py-3 border border-gray-300 rounded-lg text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {error && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {error}
                    </p>
                  )}
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full cursor-pointer py-2 sm:py-3 px-4 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                      loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        Sending OTP...
                      </span>
                    ) : (
                      "Send OTP"
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      to="/signin"
                      className="text-blue-600 hover:text-blue-500 text-sm sm:text-base font-medium transition-colors"
                    >
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </form>
            </>
          ) : null}

          {stepNum == 2 ? (
            <>
              <div className="w-full  flex flex-col p-4 sm:p-6 h-full flex-center">
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
                    <form
                      onSubmit={handleSubmitResetPassword}
                      className="space-y-4 sm:space-y-6"
                    >
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

                      {/* New Password */}
                      <div>
                        <label
                          htmlFor="password"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            required
                            minLength="8"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <FiEyeOff className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <FiEye className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            required
                            minLength="8"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            aria-label={
                              showConfirmPassword
                                ? "Hide password"
                                : "Show password"
                            }
                          >
                            {showConfirmPassword ? (
                              <FiEyeOff className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <FiEye className="text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>
                        </div>
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
                          "Complete Reset Password"
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      {showSuccess &&
        createPortal(
          <>
            <Link to={"/signin"}>
              <div className="fixed w-lvw h-lvh bg-black/50 inset-0 flex-center">
                <img
                  src="/public/success.svg"
                  alt=""
                  className="cursor-pointer"
                />
              </div>
            </Link>
          </>,
          document.body
        )}
    </div>
  );
};

export default ResetPassword;
