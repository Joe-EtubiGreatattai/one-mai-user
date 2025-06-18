import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Family from "../assets/Family.jpeg";
import useAuthStore from "../Store/Auth";

const VerifyPin = () => {
  const [pin, setPin] = useState(["", "", "", ""]);
  const { verifyPin, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    try {
      await verifyPin(pin.join(""));
      navigate("/dashboard");
    } catch (error) {
      console.error("PIN verification error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden bg-gray-50">
      {/* Form Section */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-4 sm:mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Verify Your Identity
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Enter your 4-digit PIN to continue
            </p>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-red-100 text-red-700 rounded text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="flex justify-center space-x-2 sm:space-x-4">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    id={`pin-${index}`}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={pin[index]}
                    onChange={(e) => handlePinChange(e, index)}
                    className="w-12 h-12 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || pin.some((digit) => !digit)}
                className={`w-full py-2 sm:py-3 px-4 text-white text-sm sm:text-base font-medium rounded-md ${
                  loading
                    ? "bg-[#3390d5]"
                    : "bg-[#3390d5] hover:bg-blue-700"
                } transition-colors duration-200`}
              >
                {loading ? "Verifying..." : "Verify PIN"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Image Section */}
      <div className="hidden md:flex md:w-1/2 relative bg-gray-800">
        <img
          src={Family}
          alt="Family enjoying savings"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
          <div className="max-w-md mx-auto text-center text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Extra Security
            </h2>
            <p className="text-sm sm:text-base">
              Two-factor authentication helps protect your account from
              unauthorized access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPin;
