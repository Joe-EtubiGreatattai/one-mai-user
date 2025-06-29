import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import GoogleAuthButton from "../Components/GoogleAuthButton";

import Image1 from "../assets/0.jpg";
import Image2 from "../assets/1.jpg";
import Image3 from "../assets/2.jpg";
import Image4 from "../assets/3.jpg";
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
    <div className="h-dvh flex flex-col lg:flex-row overflow-hidden bg-white">
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

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                  First Name*
                </label>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  className={`w-full px-3 py-2 border rounded-md text-sm font-light text-[#2E2E2E] ${formErrors.firstName
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

              <div>
                <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                  Last Name*
                </label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${formErrors.lastName
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

            <div>
              <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                Email*
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm ${formErrors.email ? "border-red-500" : "border-[#EAEAEA]"
                  }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[##2E2E2E]">
                Phone Number*
              </label>
              <div
                className={`py-2 px-3 border rounded-md ${formErrors.phone ? "border-red-500" : "border-[#EAEAEA]"
                  }`}
              >
                <PhoneInput
                  international
                  defaultCountry="PT"
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
                  className={`w-full px-3 py-2 border rounded-md text-sm ${formErrors.password
                      ? "border-red-500"
                      : "border-[#EAEAEA]"
                    }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  👁️
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

            <div className="flex items-start gap-2">
              <input
                name="agreed"
                type="checkbox"
                checked={formData.agreed}
                onChange={handleChange}
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
            </div>
            {formErrors.agreed && (
              <p className="text-xs text-red-600">{formErrors.agreed}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 text-white text-sm rounded-md shadow-sm font-medium ${loading ? "bg-[#3390d5]" : "bg-[#3390d5] hover:bg-blue-700"
                }`}
            >
              {loading ? "Signing you up..." : "Sign Up"}
            </button>

            {/* 🔵 Google Sign-in */}
            <GoogleAuthButton buttonText="Sign in with Google" />
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/signin" className="font-medium text-blue">
                Sign in
              </Link>
            </div>

          </form>
        </div>
      </div>

      {/* Right side - Carousel */}
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
                    <p className="text-base sm:text-lg leading-relaxed">
                      Save for your dreams!
                      Our fun and intuitive group savings app makes pooling funds
                      easy, exciting, and rewarding.
                    </p>
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

export default CreateAccount;
