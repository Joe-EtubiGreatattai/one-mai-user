import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import useBankStore from "../../Store/useBankStore";

const BankDetailsForm = ({ darkMode = false, accounts = [], setError = () => {}, setSuccess = () => {} }) => {
  const { addBankAccount, error, clearError } = useBankStore();
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    ibanNumber: "",
    beneficiaryName: "",
    swiftCode: ""
  });

  // Reset form if accounts change
  useEffect(() => {
    if (Array.isArray(accounts) && accounts.length === 0) {
      setBankDetails({
        bankName: "",
        ibanNumber: "",
        beneficiaryName: "",
        swiftCode: ""
      });
    }
  }, [accounts]);

  // Handle errors from store
  useEffect(() => {
    if (error) {
      setError(error);
      clearError();
    }
  }, [error, setError, clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBankDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        bankName: bankDetails.bankName.trim(),
        accountHolderName: bankDetails.beneficiaryName.trim(),
        iban: bankDetails.ibanNumber.replace(/\s/g, ''),
        bic: bankDetails.swiftCode.trim(),
        country: 'DE',
        currency: 'EUR'
      };

      if (!payload.bankName || !payload.accountHolderName || !payload.iban) {
        setError('Bank name, account holder name and IBAN are required');
        return;
      }

      await addBankAccount(payload);
      setSuccess("Bank account added successfully!");
      // Clear form after successful submission
      setBankDetails({
        bankName: "",
        ibanNumber: "",
        beneficiaryName: "",
        swiftCode: ""
      });
    } catch (err) {
      // Error handled by store
    }
  };

  // Don't show the form if account already exists
  if (accounts && accounts.length > 0) {
    return (
      <div className={`p-4 rounded-lg text-center ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
          Bank account already exists. Contact support for changes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`p-4 md:p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-lg md:text-xl font-medium mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Add Bank Account
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className={`block mb-2 text-sm md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Bank Name*
          </label>
          <input
            type="text"
            name="bankName"
            value={bankDetails.bankName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
            }`}
            required
            placeholder="e.g. Deutsche Bank"
          />
        </div>

        <div>
          <label className={`block mb-2 text-sm md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            IBAN Number*
          </label>
          <input
            type="text"
            name="ibanNumber"
            value={bankDetails.ibanNumber}
            onChange={(e) => {
              // Format IBAN with spaces for better readability
              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              let formattedValue = '';
              for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) formattedValue += ' ';
                formattedValue += value[i];
              }
              e.target.value = formattedValue;
              handleInputChange(e);
            }}
            className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
            }`}
            required
            placeholder="DE00 0000 0000 0000 0000 00"
            pattern="[A-Z]{2}\d{2} ?\d{4} ?\d{4} ?\d{4} ?\d{4} ?[\d]{0,2}"
            maxLength="27" // DE00 0000 0000 0000 0000 00 (24 chars + 5 spaces)
          />
        </div>

        <div>
          <label className={`block mb-2 text-sm md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Account Holder Name*
          </label>
          <input
            type="text"
            name="beneficiaryName"
            value={bankDetails.beneficiaryName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
            }`}
            required
            placeholder="As shown on your bank account"
          />
        </div>

        <div>
          <label className={`block mb-2 text-sm md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            SWIFT/BIC Code
          </label>
          <input
            type="text"
            name="swiftCode"
            value={bankDetails.swiftCode}
            onChange={(e) => {
              // Auto-uppercase and format SWIFT/BIC code
              e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
              handleInputChange(e);
            }}
            className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
            }`}
            placeholder="Optional (e.g. DEUTDEBB)"
            pattern="[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?"
            maxLength="11"
          />
        </div>
      </div>

      <button
        type="submit"
        className={`w-full mt-6 py-2 md:py-3 px-4 rounded-md ${
          darkMode ? 'bg-[#3390d5] hover:bg-blue-700' : 'bg-[#3390d5] hover:bg-blue-700'
        } text-white font-medium flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          darkMode ? 'focus:ring-offset-gray-800' : 'focus:ring-offset-white'
        } transition`}
      >
        <FiPlus className="mr-2 h-4 w-4 md:h-5 md:w-5" /> 
        <span>Add Bank Account</span>
      </button>
    </form>
  );
};

export default BankDetailsForm;