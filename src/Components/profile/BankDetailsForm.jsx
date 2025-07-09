import React, { useState, useEffect } from "react";
import { FiPlus, FiCopy, FiCheck } from "react-icons/fi";
import useBankStore from "../../Store/useBankStore";

const BankDetailsForm = ({
  darkMode = false,
  accounts = [],
  setError = () => {},
  setSuccess = () => {},
}) => {
  const { addBankAccount, getBankAccounts, error, clearError } = useBankStore();
  const [copied, setCopied] = useState(null);
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    ibanNumber: "",
    beneficiaryName: "",
    swiftCode: "",
  });

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
      await getBankAccounts();
      setSuccess("Bank account added successfully!");
      setBankDetails({
        bankName: "",
        ibanNumber: "",
        beneficiaryName: "",
        swiftCode: "",
      });
    } catch (err) {}
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  // Display bank cards
  if (accounts && accounts.length > 0) {
    return (
      <div className="w-full flex flex-col gap-6">
        {accounts.map((account) => (
          <div
            key={account._id}
            className="w-full max-w-md mx-auto rounded-xl p-6 shadow-lg bg-gradient-to-br from-[#0f1e41] to-[#1b3265] text-white font-mono relative overflow-hidden"
          >
            {/* Top */}
            <div className="flex items-center mb-8">
              {/* Chip */}
              <div className="w-10 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-sm mr-2"></div>
              {/* Contactless icon */}
              <div className="flex space-x-0.5">
                <div className="w-1 h-2 rounded-sm bg-white opacity-50"></div>
                <div className="w-1 h-3 rounded-sm bg-white opacity-50"></div>
                <div className="w-1 h-4 rounded-sm bg-white opacity-50"></div>
              </div>
            </div>

            {/* IBAN - copyable */}
            <div className="text-2xl tracking-widest font-semibold mb-3 flex items-center gap-2">
              <span>{account.iban.match(/.{1,4}/g)?.join(" ")}</span>
              <button onClick={() => handleCopy(account.iban, account._id)} className="text-white">
                {copied === account._id ? <FiCheck size={18} /> : <FiCopy size={18} />}
              </button>
            </div>

            {/* Account Holder */}
            <div className="uppercase text-xs text-slate-300">Cardholder</div>
            <div className="text-sm mb-3">{account.accountHolderName}</div>

            {/* SWIFT & Country */}
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
              <div>
                <div className="uppercase text-xs">SWIFT</div>
                <div className="text-sm">{account.bic || "N/A"}</div>
              </div>
              <div>
                <div className="uppercase text-xs">Country</div>
                <div className="text-sm">{account.country}</div>
              </div>
            </div>

            {/* Currency and status */}
            <div className="flex justify-between items-center mt-6 text-xs">
              <span className="uppercase">{account.currency}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  account.isVerified
                    ? "bg-green-600 text-white"
                    : "bg-yellow-500 text-white"
                }`}
              >
                {account.isVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Add bank form
  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full p-4 md:p-6 rounded-lg shadow-md ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      <h3 className="text-xl font-semibold mb-5">Add Bank Account</h3>

      <div className="grid gap-4">
        <Input
          label="Bank Name*"
          name="bankName"
          value={bankDetails.bankName}
          onChange={handleInputChange}
          placeholder="e.g. Deutsche Bank"
          darkMode={darkMode}
        />
        <Input
          label="IBAN Number*"
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
          placeholder="DE00 0000 0000 0000 0000 00"
          maxLength={34}
          darkMode={darkMode}
        />
        <Input
          label="Account Holder Name*"
          name="beneficiaryName"
          value={bankDetails.beneficiaryName}
          onChange={handleInputChange}
          placeholder="As shown on your bank account"
          darkMode={darkMode}
        />
        <Input
          label="SWIFT/BIC Code"
          name="swiftCode"
          value={bankDetails.swiftCode}
          onChange={(e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
            handleInputChange(e);
          }}
          placeholder="Optional (e.g. DEUTDEBB)"
          maxLength={11}
          darkMode={darkMode}
        />
      </div>

      <button
        type="submit"
        className="w-full mt-6 py-2 px-4 rounded-md bg-[#3390d5] hover:bg-blue-700 text-white font-medium flex items-center justify-center transition"
      >
        <FiPlus className="mr-2 h-4 w-4" />
        Add Bank Account
      </button>
    </form>
  );
};

const Input = ({ label, name, value, onChange, placeholder, maxLength, darkMode }) => (
  <div>
    <label className="block mb-1 font-medium">{label}</label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:outline-none ${
        darkMode
          ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
          : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500"
      }`}
    />
  </div>
);

export default BankDetailsForm;
