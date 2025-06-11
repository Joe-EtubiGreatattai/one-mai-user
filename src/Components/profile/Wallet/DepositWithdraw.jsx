import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../../profile/StripePaymentForm';
import { useState } from 'react';

const DepositWithdraw = ({
  darkMode,
  activeTab,
  formData,
  handleInputChange,
  validateAmount,
  amountError,
  stripePromise,
  handleDeposit,
  walletLoading,
  getReturnUrl,
  accounts,
  bankLoading,
  handleWithdraw,
  currency
}) => {
  const [withdrawError, setWithdrawError] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError(''); // Clear previous errors
    
    if (!formData.selectedAccount) {
      setWithdrawError('Please select a bank account');
      return;
    }

    if (!validateAmount()) return;

    try {
      await handleWithdraw(e);
    } catch (error) {
      setWithdrawError(error.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="space-y-6">
      {activeTab === "deposit" ? (
        <>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Deposit Funds</h3>
          <div>
            <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount ({currency})</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              onBlur={validateAmount}
              className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'} ${amountError ? 'border-red-500' : ''}`}
              placeholder={`Enter amount in ${currency}`}
              min="1"
              step="0.01"
              required
            />
            {amountError && <p className="mt-1 text-sm text-red-500">{amountError}</p>}
          </div>
          {formData.amount > 0 && !amountError && (
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                amount={formatCurrency(formData.amount)}
                onSubmit={handleDeposit}
                loading={walletLoading}
                darkMode={darkMode}
                returnUrl={getReturnUrl()}
              />
            </Elements>
          )}
        </>
      ) : (
        <>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Withdraw Funds</h3>
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount ({currency})</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'}`}
                placeholder={`Enter amount in ${currency}`}
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>To Account</label>
              <select
                name="selectedAccount"
                value={formData.selectedAccount}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'}`}
                required
              >
                <option value="">Select bank account</option>
                {accounts.map(account => (
                  <option key={account._id} value={account._id}>
                    {account.bankName} - {account.accountHolderName} (•••• {account.iban.slice(-4)})
                  </option>
                ))}
              </select>
            </div>
            {withdrawError && (
              <p className="text-red-500 text-sm">{withdrawError}</p>
            )}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg shadow transition ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
              
            >
              Request Withdrawal
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default DepositWithdraw;