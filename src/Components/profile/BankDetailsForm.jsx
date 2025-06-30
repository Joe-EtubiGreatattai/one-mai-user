import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import useBankStore from "../../Store/useBankStore";

const BankDetailsForm = ({
  darkMode = false,
  accounts = [],
  setError = () => {},
  setSuccess = () => {},
}) => {
  const { addBankAccount, getBankAccounts, error, clearError } = useBankStore();

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    ibanNumber: "",
    beneficiaryName: "",
    swiftCode: "",
  });

  // Reset form when accounts are cleared
  useEffect(() => {
    if (Array.isArray(accounts) && accounts.length === 0) {
      setBankDetails({
        bankName: "",
        ibanNumber: "",
        beneficiaryName: "",
        swiftCode: "",
      });
    }
  }, [accounts]);

  useEffect(() => {
    if (error) {
      setError(error);
      clearError();
    }
  }, [error, setError, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      bankName: bankDetails.bankName.trim(),
      accountHolderName: bankDetails.beneficiaryName.trim(),
      iban: bankDetails.ibanNumber.replace(/\s/g, ""),
      bic: bankDetails.swiftCode.trim(),
      country: "DE",
      currency: "EUR",
    };

    if (!payload.bankName || !payload.accountHolderName || !payload.iban) {
      setError("Bank name, account holder name and IBAN are required");
      return;
    }

    try {
      await addBankAccount(payload);
      await getBankAccounts(); // refresh list
      setSuccess("Bank account added successfully!");
      setBankDetails({
        bankName: "",
        ibanNumber: "",
        beneficiaryName: "",
        swiftCode: "",
      });
    } catch (err) {
      // handled in store
    }
  };

  // If accounts exist, show them instead of the form
  if (accounts && accounts.length > 0) {
    return (
      <div className={`p-2 md:p-4 rounded-lg space-y-4 ${darkMode ? "bg-white-800" : "bg-white"}`}>
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>
          Your Bank Accounts
        </h3>
        {accounts.map((account) => (
          <div
            key={account._id}
            className={`p-3 rounded-md border text-sm ${
              darkMode
                ? "border-gray-600 bg-gray-700 text-white"
                : "border-gray-300 bg-white text-gray-800"
            }`}
          >
            <p><strong>Bank:</strong> {account.bankName}</p>
            <p><strong>Account Holder:</strong> {account.accountHolderName}</p>
            <p><strong>IBAN:</strong> {account.iban}</p>
            <p><strong>BIC:</strong> {account.bic}</p>
            <p><strong>Country:</strong> {account.country}</p>
            <p><strong>Currency:</strong> {account.currency}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full p-2 md:p-6 md:rounded-lg md:shadow-md ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h3
        className={`text-lg md:text-xl font-medium mb-3 md:mb-4 ${
          darkMode ? "text-white" : "text-gray-800"
        }`}
      >
        Add Bank Account
      </h3>

      <div className="space-y-3 md:space-y-4">
        <div>
          <label className={`block mb-1 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Bank Name*
          </label>
          <input
            type="text"
            name="bankName"
            value={bankDetails.bankName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
            }`}
            required
            placeholder="e.g. Deutsche Bank"
          />
        </div>

        <div>
          <label className={`block mb-1 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            IBAN Number*
          </label>
          <input
            type="text"
            name="ibanNumber"
            value={bankDetails.ibanNumber}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
              let formatted = "";
              for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formatted += " ";
                formatted += value[i];
              }
              e.target.value = formatted;
              handleInputChange(e);
            }}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
            }`}
            required
            placeholder="DE00 0000 0000 0000 0000 00"
            maxLength="34"
          />
        </div>

        <div>
          <label className={`block mb-1 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            Account Holder Name*
          </label>
          <input
            type="text"
            name="beneficiaryName"
            value={bankDetails.beneficiaryName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
            }`}
            required
            placeholder="As shown on your bank account"
          />
        </div>

        <div>
          <label className={`block mb-1 font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            SWIFT/BIC Code
          </label>
          <input
            type="text"
            name="swiftCode"
            value={bankDetails.swiftCode}
            onChange={(e) => {
              e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
              handleInputChange(e);
            }}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-800"
            }`}
            placeholder="Optional (e.g. DEUTDEBB)"
            maxLength="11"
          />
        </div>
      </div>

      <button
        type="submit"
        className={`w-full mt-4 py-2 px-4 rounded-md ${
          darkMode ? "bg-[#3390d5] hover:bg-blue-700" : "bg-[#3390d5] hover:bg-blue-700"
        } text-white font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          darkMode ? "focus:ring-offset-gray-800" : "focus:ring-offset-white"
        } transition`}
      >
        <FiPlus className="mr-2 h-4 w-4" />
        <span>Add Bank Account</span>
      </button>
    </form>
  );
};

export default BankDetailsForm;
