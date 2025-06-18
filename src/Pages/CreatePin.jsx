import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Family from "../assets/Family.jpeg";
import useAuthStore from "../Store/Auth";

const CreatePin = () => {
  const [step, setStep] = useState(1);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const { createPin, loading, error, clearError } = useAuthStore();
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

  const handleConfirmPinChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newConfirmPin = [...confirmPin];
    newConfirmPin[index] = value;
    setConfirmPin(newConfirmPin);

    if (value && index < 3) {
      document.getElementById(`confirm-pin-${index + 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (step === 1) {
      setStep(2);
      setConfirmPin(["", "", "", ""]);
      return;
    }

    if (pin.join("") !== confirmPin.join("")) {
      alert("PINs don't match!");
      return;
    }

    try {
      await createPin(pin.join(""));
      navigate("/dashboard");
    } catch (error) {
      console.error("PIN creation error:", error);
    }
  };

  return (
    <div className="h-dvh bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Form Section - Always visible */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-4 sm:mb-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#2E2E2E]">
              {step === 1 ? "Create PIN" : "Confirm PIN"}
            </h2>
            <p className="text-sm sm:text-base text-[#9A9A9A] mt-2">
              {step === 1
                ? "Create a 4-digit PIN to secure your account"
                : "Please re-enter your PIN to confirm"}
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
                    id={step === 1 ? `pin-${index}` : `confirm-pin-${index}`}
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="1"
                    value={step === 1 ? pin[index] : confirmPin[index]}
                    onChange={
                      step === 1
                        ? (e) => handlePinChange(e, index)
                        : (e) => handleConfirmPinChange(e, index)
                    }
                    className="w-12 h-12 sm:w-16 sm:h-16 text-center text-xl sm:text-2xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  (step === 1 && pin.some((digit) => !digit)) ||
                  (step === 2 && confirmPin.some((digit) => !digit))
                }
                className={`w-full cursor-pointer py-2 sm:py-3 px-4 text-white text-sm sm:text-base font-medium rounded-md bg-blue transition-colors duration-200`}
              >
                {loading
                  ? "Processing..."
                  : step === 1
                  ? "Continue"
                  : "Confirm PIN"}
              </button>

              {step === 2 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-full cursor-pointer text-center text-blue text-sm sm:text-base font-medium transition-colors duration-200"
                >
                  Back to create PIN
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Image Section - Hidden on mobile */}
      <div className="hidden md:flex md:w-1/2 relative bg-gray-800">
        <img
          src={Family}
          alt="Family enjoying savings"
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-[#00182b] opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
          <div className="max-w-md mx-auto text-center text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">
              Secure Your Account
            </h2>
            <p className="text-sm sm:text-base">
              Your PIN adds an extra layer of security to protect your savings
              and transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePin;
