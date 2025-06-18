import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Family from "../assets/Family.jpeg";
import useAuthStore from "../Store/Auth";

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
    agreed: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const { initiateSignup, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) clearError();
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    if (error) clearError();
    if (formErrors.phone) {
      setFormErrors((prev) => ({
        ...prev,
        phone: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.phone) {
      errors.phone = "Phone number is required";
    }
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!formData.agreed) errors.agreed = "You must agree to the terms";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await initiateSignup({
        phone: formData.phone,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userType: "normal",
      });

      navigate("/otp", {
        state: {
          signupData: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phoneNumber: formData.phone,
            password: formData.password,
            referralCode: formData.referralCode || undefined,
          },
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="h-dvh flex flex-col lg:flex-row overflow-hidden bg-white ">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex-center flex flex-col p-4 sm:p-6 md:p-8 h-full overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#2E2E2E]">
              Create Account
            </h2>
            <p className="text-sm font-normal text-[#9A9A9A]">
              Please provide us with your basic details below so that we can get
              to know you better.
            </p>
          </div>

          {error && (
            <div className="mb-3 sm:mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          <div className="rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* First Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                    First Name*
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-smv font-light text-[#838383] ${
                      formErrors.firstName
                        ? "border-red-500"
                        : "border-[#EAEAEA]"
                    }`}
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                    Last Name*
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      formErrors.lastName
                        ? "border-red-500"
                        : "border-[#EAEAEA]"
                    }`}
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                  Email*
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    formErrors.email ? "border-red-500" : "border-[#EAEAEA]"
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="">
                <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                  Phone Number*
                </label>
                <div
                  className={`py-2 px-3 border rounded-md ${
                    formErrors.phone ? "border-red-500" : "border-[#EAEAEA]"
                  }`}
                >
                  <PhoneInput
                    international
                    defaultCountry="US"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    inputClassName="w-full px-3 py-3 text-sm"
                  />
                </div>
                {formErrors.phone && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                  Password*
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm ${
                      formErrors.password
                        ? "border-red-500"
                        : "border-[#EAEAEA]"
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.password}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Referral Code */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                  Referral Code (Optional)
                </label>
                <input
                  name="referralCode"
                  type="text"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#EAEAEA] rounded-md text-sm"
                />
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center gap-1">
                <div className="flex items-center h-5">
                  <input
                    name="agreed"
                    type="checkbox"
                    checked={formData.agreed}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue focus:ring-blue border-[#EAEAEA] rounded"
                  />
                </div>
                <div className="">
                  <label className="text-xs sm:text-sm text-gray-700">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="text-blue hover:text-blue"
                    >
                      Terms and Conditions
                    </a>
                  </label>
                  {formErrors.agreed && (
                    <p className="mt-1 text-xs text-red-600">
                      {formErrors.agreed}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading ? "bg-[#3390d5]" : "bg-blue hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue`}
              >
                {loading ? (
                  <>
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
                    Signing you up...
                  </>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="font-medium text-blue hover:text-blue"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={Family}
          alt="Family enjoying savings"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#00182b] opacity-40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2 text-center">
            Welcome to MAI
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-center">
            Join forces with friends and family to save for your dreams!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
