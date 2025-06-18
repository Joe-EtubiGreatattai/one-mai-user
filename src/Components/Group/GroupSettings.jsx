import React, { useState, useEffect, useMemo } from "react";
import {
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiUsers,
  FiInfo,
} from "react-icons/fi";
import { Tooltip } from "react-tooltip";

const GroupSettings = ({ groupData, setGroupData, setCurrentStep }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    frequency: false,
    savingsAmount: false,
    maxMembers: false,
    payoutDate: false,
  });

  // Generate future months only once
  const futureMonths = useMemo(() => {
    const months = [];
    const today = new Date();
    for (let i = 1; i <= 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        label: date.toLocaleString("default", {
          month: "long",
          year: "numeric",
        }),
        value: date.toISOString().split("T")[0],
      });
    }
    return months;
  }, []);

  // Set default values on first render
  useEffect(() => {
    if (!groupData.frequency) {
      setGroupData((prev) => ({ ...prev, frequency: "weekly" }));
    }
    if (!groupData.savingsAmount) {
      setGroupData((prev) => ({ ...prev, savingsAmount: "50" }));
    }
    if (!groupData.maxMembers) {
      setGroupData((prev) => ({ ...prev, maxMembers: "5" }));
    }
  }, [setGroupData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
    setTouchedFields((prev) => ({ ...prev, [name]: true }));
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setGroupData((prev) => ({ ...prev, [name]: value }));
      setTouchedFields((prev) => ({ ...prev, [name]: true }));
    }
  };

  const handleDateSelect = (date) => {
    setGroupData((prev) => ({ ...prev, payoutDate: date }));
    setTouchedFields((prev) => ({ ...prev, payoutDate: true }));
    setShowDatePicker(false);
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const isFormValid = () => {
    return (
      groupData.frequency &&
      groupData.savingsAmount &&
      groupData.maxMembers &&
      groupData.maxMembers >= 2 &&
      groupData.maxMembers <= 20 &&
      groupData.payoutDate
    );
  };

  const calculateRecommendedAmount = () => {
    // Simple recommendation logic - can be enhanced with more complex calculations
    if (groupData.frequency === "daily") return "10";
    if (groupData.frequency === "weekly") return "50";
    if (groupData.frequency === "monthly") return "200";
    return "50";
  };

  const applyRecommendation = () => {
    const recommendedAmount = calculateRecommendedAmount();
    const recommendedDate = futureMonths[5].value; // 6 months from now

    setGroupData((prev) => ({
      ...prev,
      savingsAmount: recommendedAmount,
      payoutDate: recommendedDate,
    }));
    setTouchedFields((prev) => ({
      ...prev,
      savingsAmount: true,
      payoutDate: true,
    }));
  };

  const getDurationFromFrequency = () => {
    if (!groupData.frequency) return "";

    const today = new Date();
    const payoutDate = new Date(groupData.payoutDate);
    const diffTime = Math.abs(payoutDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (groupData.frequency === "daily") return `${diffDays} days`;
    if (groupData.frequency === "weekly")
      return `${Math.floor(diffDays / 7)} weeks`;
    if (groupData.frequency === "monthly")
      return `${Math.floor(diffDays / 30)} months`;
    return "";
  };

  return (
    <div className=" flex items-center justify-center w-[60%] m-auto  ">
      <div className="w-full max-w-2xl bg-white rounded-xl sm:rounded-2xl  border   border-none">
        {/* Header */}
        <div className="flex items-center mb-2">
          <button
            onClick={() => setCurrentStep(2)}
            className="text-gray-500 hover:text-gray-700 mr-2 transition-colors duration-200"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Create Group</h1>
        </div>
        <div className="flex items-center mb-2">
          <p className="sm-para">Configure your savings group parameters</p>
        </div>

        <div className="space-y-4 mt-4 ">
          {/* Savings Plan */}
          <div className=" rounded-lg sm:rounded-xl  ">
            {/* <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
              <FiDollarSign className="mr-2 text-[#3390d5] w-4 h-4 sm:w-5 sm:h-5" />
              Savings Plan
            </label> */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-xs sm:text-sm text-gray-500">
                    Frequency
                  </label>
                  <FiInfo
                    className="ml-1 text-gray-400 cursor-help w-3 h-3 sm:w-4 sm:h-4"
                    data-tooltip-id="frequency-tooltip"
                    data-tooltip-content="How often members contribute to the savings pool"
                  />
                  <Tooltip id="frequency-tooltip" />
                </div>
                <select
                  name="frequency"
                  value={groupData.frequency || ""}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur("frequency")}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent focus:outline-none transition-all"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-xs sm:text-sm text-gray-500">
                    Max Members
                  </label>
                  <FiInfo
                    className="ml-1 text-gray-400 cursor-help w-3 h-3 sm:w-4 sm:h-4"
                    data-tooltip-id="members-tooltip"
                    data-tooltip-content="Number of participants in your savings group (2-20)"
                  />
                  <Tooltip id="members-tooltip" />
                </div>
                <input
                  type="text"
                  name="maxMembers"
                  value={groupData.maxMembers || ""}
                  onChange={handleNumberInput}
                  onBlur={() => handleBlur("maxMembers")}
                  placeholder="5"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent focus:outline-none transition-all"
                />
                {touchedFields.maxMembers && (
                  <>
                    {!groupData.maxMembers ? (
                      <p className="text-red-500 text-xs mt-1">
                        Please enter member count
                      </p>
                    ) : (
                      (groupData.maxMembers < 2 ||
                        groupData.maxMembers > 20) && (
                        <p className="text-red-500 text-xs mt-1">
                          2-20 members allowed
                        </p>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Group Configuration */}
          <div className=" rounded-lg sm:rounded-xl ">
            {/* <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center">
              <FiUsers className="mr-2 text-[#3390d5] w-4 h-4 sm:w-5 sm:h-5" />
              Group Configuration
            </label> */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-xs sm:text-sm text-gray-500">
                    Payout Date
                  </label>
                  <FiInfo
                    className="ml-1 text-gray-400 cursor-help w-3 h-3 sm:w-4 sm:h-4"
                    data-tooltip-id="payout-tooltip"
                    data-tooltip-content="When the accumulated savings will be distributed"
                  />
                  <Tooltip id="payout-tooltip" />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`w-full flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border ${
                      touchedFields.payoutDate && !groupData.payoutDate
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all`}
                    aria-label="Select payout date"
                  >
                    <span>
                      {groupData.payoutDate
                        ? new Date(groupData.payoutDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                              day: "numeric",
                            }
                          )
                        : "Select date"}
                    </span>
                    <FiCalendar className="text-gray-400 w-4 h-4" />
                  </button>
                  {touchedFields.payoutDate && !groupData.payoutDate && (
                    <p className="text-red-500 text-xs mt-1">
                      Please select a payout date
                    </p>
                  )}
                  {showDatePicker && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md sm:rounded-lg p-2 border border-gray-200 max-h-60 overflow-y-auto">
                      {futureMonths.map((month) => (
                        <button
                          key={month.value}
                          onClick={() => handleDateSelect(month.value)}
                          className={`w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded hover:bg-blue-50 transition-colors ${
                            groupData.payoutDate === month.value
                              ? "bg-[#3390d5] text-[#3390d5] font-medium"
                              : ""
                          }`}
                        >
                          {month.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-xs sm:text-sm text-gray-500">
                    Amount ($)
                  </label>
                  <FiInfo
                    className="ml-1 text-gray-400 cursor-help w-3 h-3 sm:w-4 sm:h-4"
                    data-tooltip-id="amount-tooltip"
                    data-tooltip-content="Amount each member contributes per interval"
                  />
                  <Tooltip id="amount-tooltip" />
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 sm:top-2 text-gray-400 text-sm sm:text-base">
                    $
                  </span>
                  <input
                    type="text"
                    name="savingsAmount"
                    value={groupData.savingsAmount || ""}
                    onChange={handleNumberInput}
                    onBlur={() => handleBlur("savingsAmount")}
                    placeholder="50"
                    className="w-full pl-7 sm:pl-8 pr-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent focus:outline-none transition-all"
                  />
                  {touchedFields.savingsAmount && !groupData.savingsAmount && (
                    <p className="text-red-500 text-xs mt-1">
                      Please enter an amount
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row space-y-3 sm:space-y-0 space-x-0 sm:space-x-3 md:space-x-4 mt-6 sm:mt-8 md:mt-10">
          <button
            onClick={() => setCurrentStep(2)}
            className="flex-1 bg-gray-100 text-gray-800 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-md sm:rounded-lg hover:bg-gray-200 transition-all"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(4)}
            disabled={!isFormValid()}
            className={`flex-1 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-md sm:rounded-lg transition-all mb-3 sm:mb-0 ${
              isFormValid()
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
