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
  const [touchedFields, setTouchedFields] = useState({
    frequency: false,
    savingsAmount: false,
    maxMembers: false,
    payoutDate: false,
  });

  // Get minimum date (tomorrow)
  const minDate = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  // Get maximum date (1 year from now)
  const maxDate = useMemo(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
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

  const handleDateChange = (e) => {
    const { value } = e.target;
    setGroupData((prev) => ({ ...prev, payoutDate: value }));
    setTouchedFields((prev) => ({ ...prev, payoutDate: true }));
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
    // Set recommended date to 6 months from now
    const recommendedDate = new Date();
    recommendedDate.setMonth(recommendedDate.getMonth() + 6);
    const dateString = recommendedDate.toISOString().split('T')[0];

    setGroupData((prev) => ({
      ...prev,
      savingsAmount: recommendedAmount,
      payoutDate: dateString,
    }));
    setTouchedFields((prev) => ({
      ...prev,
      savingsAmount: true,
      payoutDate: true,
    }));
  };

  const getDurationFromFrequency = () => {
    if (!groupData.frequency || !groupData.payoutDate) return "";

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
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-[#3390d5] focus:border-transparent focus:outline-none transition-all"
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
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-[#3390d5] focus:border-transparent focus:outline-none transition-all"
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
                  <input
                    type="date"
                    name="payoutDate"
                    value={groupData.payoutDate || ""}
                    onChange={handleDateChange}
                    onBlur={() => handleBlur("payoutDate")}
                    min={minDate}
                    max={maxDate}
                    className={`w-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border ${
                      touchedFields.payoutDate && !groupData.payoutDate
                        ? "border-red-300"
                        : "border-gray-300"
                    } rounded-md sm:rounded-lg focus:ring-2 focus:ring-[#3390d5] focus:border-transparent focus:outline-none transition-all`}
                  />
                  <FiCalendar className="absolute right-3 top-1.5 sm:top-2 text-gray-400 w-4 h-4 pointer-events-none" />
                  {touchedFields.payoutDate && !groupData.payoutDate && (
                    <p className="text-red-500 text-xs mt-1">
                      Please select a payout date
                    </p>
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
                    className="w-full pl-7 sm:pl-8 pr-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-[#3390d5] focus:border-transparent focus:outline-none transition-all"
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

        {/* Quick Setup Recommendation */}
        <div className="mt-4 p-3 bg-[#e6f2fa] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#3390d5] font-medium">Quick Setup</p>
              <p className="text-xs text-[#3390d5]">
                Apply recommended settings based on frequency
              </p>
            </div>
            <button
              onClick={applyRecommendation}
              className="px-3 py-1 text-xs bg-[#d1e7f7] text-[#3390d5] rounded-md hover:bg-[#b8d9f2] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Duration Display */}
        {groupData.payoutDate && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              Duration: <span className="font-medium">{getDurationFromFrequency()}</span>
            </p>
          </div>
        )}

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
                ? "bg-[#3390d5] text-white shadow-md hover:shadow-lg hover:bg-[#2a7cb9]"
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