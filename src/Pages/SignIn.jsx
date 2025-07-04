import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

import GoogleAuthButton from "../Components/GoogleAuthButton";

import Image1 from "../assets/0.jpg";
import Image2 from "../assets/1.jpg";
import Image3 from "../assets/2.jpg";
import Image4 from "../assets/3.jpg";
import useAuthStore from "../Store/Auth";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState(["", "", "", ""]);

  const {
    login,
    verifyPin,
    loading,
    error: authError,
    clearError,
    user,
    tempUser,
  } = useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate, clearError]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError, setError]);

  const handlePinChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);

    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await verifyPin(pin.join(""));
    } catch (error) {
      console.error("PIN verification error:", error);
      setError(error.message || "PIN verification failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login({
        email,
        password,
        rememberMe,
        userType: "normal",
      });

      if (response?.requiresPinVerification) {
        setShowPinModal(true);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* PIN Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Identity
              </h2>
              <p className="text-gray-600">
                Enter your 4-digit PIN to continue
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="flex justify-center space-x-4">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="password"
                    inputMode="numeric"
                    maxLength="1"
                    value={pin[index]}
                    onChange={(e) => handlePinChange(e, index)}
                    className="w-16 h-16 text-center text-2xl border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || pin.some((digit) => !digit)}
                className={`w-full py-3 px-4 text-white font-medium rounded-md ${loading
                  ? "bg-[#3390d5]"
                  : "bg-[#3390d5] hover:bg-blue-700"
                  }`}
              >
                {loading ? "Verifying..." : "Verify PIN"}
              </button>
            </form>
          </div>
        </div>
      )}


      <div className="w-full md:w-1/2 sm:bg-gray-50 flex flex-col items-center justify-center px-4 py-14 sm:p-6 lg:p-8">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-left sm:text-center">
            <h2 className="text-2xl max-sm:text-start sm:text-3xl font-semibold sm:font-bold text-gray-900 mb-1 sm:mb-2">
              Sign In
            </h2>
            <p className="text-base sm:text-lg max-sm:text-start max-sm:text-sm text-gray-500">
              Welcome Back We've Missed You!
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50  text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="sm:bg-white sm:p-8 rounded-lg sm:shadow-md">
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Email"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 ">

                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-[#3390d5] hover:text-[#3390d5] whitespace-nowrap"
                >
                  Forgot password?
                </Link>
              </div>

              {/* <div className="flex items-start gap-2">
              <input
            name="agreed"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="h-4 w-4 mt-1 text-blue border-[#EAEAEA] rounded"
              />
              <label className="text-xs sm:text-sm text-gray-700">
            I agree to the{" "}
            <Link to="/terms" className="text-blue underline">
              Terms and Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue underline">
              Privacy Policy
            </Link>
              </label>
            </div> */}

              <button
                type="submit"
                disabled={loading}
                className={`max-sm:mt-4  w-full py-2 px-4 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading
                  ? "bg-[#3390d5] cursor-not-allowed"
                  : "bg-[#3390d5] bg-[#3390d5]"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
              {/* 🔵 Google Sign-in */}
              <GoogleAuthButton buttonText="Sign in with Google" />
            </form>

            <div className="mt-4 sm:mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-[#3390d5] hover:text-[#3390d5]"
                >
                  Create account
                </Link>
              </p>
            </div>
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
                <div className="absolute inset-0 bg-[#00182b] opacity-40"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 lg:p-8 text-white">
                  <div className="max-w-md mx-auto text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-1">
                      OneMAI
                    </h2>
                    <div className="text-base sm:text-lg font-medium mb-2">
                      Group Power. Personal Gains
                    </div>
                    {/* <p className="text-base sm:text-lg leading-relaxed">
                      Save for your dreams!
                      Our fun and intuitive group savings app makes pooling funds
                      easy, exciting, and rewarding.
                    </p> */}
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default SignIn;