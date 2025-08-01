import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import axios from '../../../Api/axios';
import toast from 'react-hot-toast';
import StripePaymentForm from './../StripePaymentForm';

const DepositWithdraw = ({
  darkMode,
  activeTab,
  formData,
  handleInputChange,
  validateAmount,
  amountError,
  stripePromise,
  walletLoading,
  accounts,
  bankLoading,
  handleWithdraw,
  currency = 'EUR', // Default to EUR
  getReturnUrl
}) => {
  const [withdrawError, setWithdrawError] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleDepositClick = async () => {
    if (!validateAmount()) return;

    setDepositLoading(true);
    try {
      const payload = {
        amount: Number(formData.amount),
        currency: "eur" // Always use EUR for Stripe
      };

      const res = await axios.post("/api/wallet/create_intent", payload);

      if (res?.data?.success && res?.data?.clientSecret) {
        setClientSecret(res.data.clientSecret);
        setShowStripeForm(true);
      } else {
        throw new Error(res.data.message || "Failed to initialize payment");
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message;
      toast.error(message || "Failed to initialize payment");
    } finally {
      setDepositLoading(false);
    }
  };

  const handleStripePaymentSuccess = async (paymentIntentId) => {
    try {
      toast.success(`Deposit of ${formatCurrency(formData.amount)} successful!`);
      
      // Reset form state
      setShowStripeForm(false);
      setClientSecret('');
      handleInputChange({ target: { name: 'amount', value: '' } });
      
      // Trigger wallet refresh if available
      if (window.refreshWalletData) {
        window.refreshWalletData();
      } else {
        // Fallback: reload page after a delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      console.error('Error handling payment success:', err);
      toast.error("Payment successful, but failed to refresh wallet. Please refresh the page.");
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    setWithdrawError('');
    
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

  const handleBackToAmount = () => {
    setShowStripeForm(false);
    setClientSecret('');
  };

  return (
    <div className="space-y-6">
      {activeTab === "deposit" ? (
        <>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Deposit Funds
          </h3>
          
          {!showStripeForm ? (
            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Amount (€)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                onBlur={validateAmount}
                className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'
                } ${amountError ? 'border-red-500' : ''}`}
                placeholder="Enter amount in EUR"
                min="1"
                step="0.01"
                required
              />
              {amountError && <p className="mt-1 text-sm text-red-500">{amountError}</p>}
              
              <button
                onClick={handleDepositClick}
                disabled={depositLoading || !formData.amount || walletLoading}
                className={`w-full py-3 mt-4 rounded-lg shadow transition ${
                  darkMode
                    ? 'bg-[#3390d5] hover:bg-blue-700 text-white disabled:bg-gray-600'
                    : 'bg-[#3390d5] hover:bg-blue-700 text-white disabled:bg-gray-400'
                } disabled:cursor-not-allowed`}
              >
                {depositLoading ? "Initializing..." : `Continue to Payment`}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'} border`}>
                <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Deposit Amount: {formatCurrency(formData.amount)}
                </h4>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Please enter your card details to complete the deposit
                </p>
              </div>

              {stripePromise && clientSecret ? (
                <Elements 
                  stripe={stripePromise}
                  options={{
                    clientSecret: clientSecret,
                    appearance: {
                      theme: darkMode ? 'night' : 'stripe',
                      variables: {
                        colorPrimary: '#3390d5',
                      }
                    }
                  }}
                  key={clientSecret} // Force re-render when clientSecret changes
                >
                  <StripePaymentForm
                    amount={formData.amount}
                    onPaymentSuccess={handleStripePaymentSuccess}
                    loading={depositLoading}
                    darkMode={darkMode}
                    returnUrl={getReturnUrl()}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Loading payment form...
                  </p>
                </div>
              )}

              <button
                onClick={handleBackToAmount}
                disabled={depositLoading}
                className={`w-full py-2 px-4 rounded-lg border transition ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                } disabled:cursor-not-allowed`}
              >
                Back to Amount
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Withdraw Funds
          </h3>
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Amount (€)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'
                }`}
                placeholder="Enter amount in EUR"
                min="1"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                To Account
              </label>
              <select
                name="selectedAccount"
                value={formData.selectedAccount}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-blue-300 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-100 border-gray-300'
                }`}
                required
              >
                <option value="">Select bank account</option>
                {accounts.map(account => (
                  <option key={account._id} value={account._id}>
                    {account.bankName} - {account.accountHolderName} (•••• {account.iban?.slice(-4)})
                  </option>
                ))}
              </select>
            </div>
            {withdrawError && <p className="text-red-500 text-sm">{withdrawError}</p>}
            <button
              type="submit"
              className={`w-full py-3 rounded-lg shadow transition ${
                darkMode ? 'bg-[#3390d5] hover:bg-blue-700 text-white' : 'bg-[#3390d5] hover:bg-blue-700 text-white'
              }`}
              disabled={walletLoading}
            >
              {walletLoading ? "Processing..." : "Request Withdrawal"}
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default DepositWithdraw;