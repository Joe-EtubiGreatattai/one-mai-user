import React from 'react';
import { FiEye, FiEyeOff, FiArrowDown, FiArrowUp, FiPlus } from 'react-icons/fi';

const WalletOverview = ({
  darkMode,
  balance,
  balanceVisible,
  setBalanceVisible,
  formatCurrency,
  setActiveTab,
  transactions,
  getTransactions,
  cards,
  setShowCardModal
}) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Balance Card */}
      <div className={`p-4 md:p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
        <div className="flex justify-between items-center mb-4">
          <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
            Available Balance
          </p>
          <button
            onClick={() => setBalanceVisible(!balanceVisible)}
            className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-100'}`}
            aria-label={balanceVisible ? "Hide balance" : "Show balance"}
          >
            {balanceVisible ? (
              <FiEyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-blue-600'}`} />
            ) : (
              <FiEye className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-blue-600'}`} />
            )}
          </button>
        </div>
        
        <p className={`text-3xl md:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 md:mb-6`}>
          {balanceVisible ? formatCurrency(balance) : '•••••'}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          <button
            onClick={() => setActiveTab("deposit")}
            className={`py-2 md:py-3 px-2 rounded-lg shadow transition flex items-center justify-center space-x-2 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <FiArrowDown className="h-4 w-4 md:h-5 md:w-5" />
            <span>Deposit</span>
          </button>
          
          <button
            onClick={() => setActiveTab("withdraw")}
            className={`py-2 md:py-3 px-2 rounded-lg shadow transition flex items-center justify-center space-x-2 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <FiArrowUp className="h-4 w-4 md:h-5 md:w-5" />
            <span>Withdraw</span>
          </button>
          
          <button
            onClick={() => setActiveTab("transfer")}
            className={`py-2 md:py-3 px-2 rounded-lg shadow transition flex items-center justify-center space-x-2 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-white hover:bg-gray-100 text-gray-800'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <FiArrowUp className="h-4 w-4 md:h-5 md:w-5" />
            <span>Transfer</span>
          </button>
        </div>
      </div>

      {/* Transactions Card */}
      <div className={`p-4 md:p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-lg md:text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Recent Transactions
          </h3>
          <button
            className={`text-sm md:text-base ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} focus:outline-none focus:ring-2 focus:ring-blue-500 rounded`}
            onClick={() => getTransactions()}
          >
            Refresh
          </button>
        </div>
        
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map(tx => (
              <div
                key={tx.id}
                className={`p-3 md:p-4 rounded-lg flex items-center justify-between ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                } transition cursor-pointer`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === 'deposit' 
                      ? (darkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-600') 
                      : (darkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-600')
                  }`}>
                    {tx.type === 'deposit' ? (
                      <FiArrowDown className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <FiArrowUp className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm md:text-base font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                      {tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </p>
                    <p className={`text-xs md:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(tx.createdAt).toLocaleDateString()} • {tx.status}
                    </p>
                  </div>
                </div>
                <p className={`text-sm md:text-base font-bold ${
                  tx.type === 'deposit' 
                    ? (darkMode ? 'text-green-400' : 'text-green-600') 
                    : (darkMode ? 'text-red-400' : 'text-red-600')
                }`}>
                  {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No transactions yet
          </p>
        )}
      </div>
    </div>
  );
};

export default WalletOverview;