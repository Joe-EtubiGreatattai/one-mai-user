import React from 'react';
import { FiEye, FiEyeOff, FiArrowDown, FiArrowUp, FiRefreshCw, FiTrendingUp, FiClock, FiCheck } from 'react-icons/fi';

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
    <div className="space-y-6 md:space-y-8">
      {/* Balance Card */}
      <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl shadow-xl ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border border-gray-700' 
          : 'bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 border border-blue-100'
      }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#3390d5] transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-[#3390d5] transform -translate-x-24 translate-y-24"></div>
        </div>
        
        <div className="relative p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className={`text-sm md:text-base font-medium ${
                darkMode ? 'text-gray-300' : 'text-blue-800'
              }`}>
                Available Balance
              </p>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  darkMode ? 'bg-green-400' : 'bg-green-500'
                }`}></div>
                <span className={`text-xs ${
                  darkMode ? 'text-gray-400' : 'text-blue-600'
                }`}>
                  Active
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setBalanceVisible(!balanceVisible)}
              className={`p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#3390d5]/25 ${
                darkMode 
                  ? 'bg-gray-700/50 hover:bg-gray-600/60 backdrop-blur-sm' 
                  : 'bg-white/60 hover:bg-white/80 backdrop-blur-sm'
              }`}
              aria-label={balanceVisible ? "Hide balance" : "Show balance"}
            >
              {balanceVisible ? (
                <FiEyeOff className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-[#3390d5]'}`} />
              ) : (
                <FiEye className={`h-5 w-5 ${darkMode ? 'text-gray-300' : 'text-[#3390d5]'}`} />
              )}
            </button>
          </div>
          
          <div className="mb-8">
            <p className={`text-4xl md:text-5xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            } mb-2 tracking-tight`}>
              {balanceVisible ? formatCurrency(balance) : '••••••'}
            </p>
            {balanceVisible && (
              <div className="flex items-center">
                <FiTrendingUp className={`h-4 w-4 mr-2 ${
                  darkMode ? 'text-green-400' : 'text-green-500'
                }`} />
                <span className={`text-sm ${
                  darkMode ? 'text-green-400' : 'text-green-600'
                }`}>
                  +2.5% from last month
                </span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <button
              onClick={() => setActiveTab("deposit")}
              className={`group relative overflow-hidden py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#3390d5]/25 ${
                darkMode 
                  ? 'bg-gray-700/60 hover:bg-gray-600/70 backdrop-blur-sm border border-gray-600' 
                  : 'bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-green-500/20 group-hover:bg-green-500/30' 
                    : 'bg-green-100 group-hover:bg-green-200'
                }`}>
                  <FiArrowDown className={`h-5 w-5 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
                <span className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Deposit
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab("withdraw")}
              className={`group relative overflow-hidden py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#3390d5]/25 ${
                darkMode 
                  ? 'bg-gray-700/60 hover:bg-gray-600/70 backdrop-blur-sm border border-gray-600' 
                  : 'bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-orange-500/20 group-hover:bg-orange-500/30' 
                    : 'bg-orange-100 group-hover:bg-orange-200'
                }`}>
                  <FiArrowUp className={`h-5 w-5 ${
                    darkMode ? 'text-orange-400' : 'text-orange-600'
                  }`} />
                </div>
                <span className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Withdraw
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab("transfer")}
              className={`group relative overflow-hidden py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#3390d5]/25 ${
                darkMode 
                  ? 'bg-gray-700/60 hover:bg-gray-600/70 backdrop-blur-sm border border-gray-600' 
                  : 'bg-white/70 hover:bg-white/90 backdrop-blur-sm border border-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-blue-500/20 group-hover:bg-blue-500/30' 
                    : 'bg-blue-100 group-hover:bg-blue-200'
                }`}>
                  <FiArrowUp className={`h-5 w-5 transform rotate-45 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
                <span className={`font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Transfer
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Card */}
      <div className={`rounded-2xl md:rounded-3xl shadow-xl overflow-hidden ${
        darkMode 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-100'
      }`}>
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className={`text-xl md:text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Recent Transactions
              </h3>
              <p className={`text-sm mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your latest activity
              </p>
            </div>
            
            <button
              className={`group flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#3390d5]/25 ${
                darkMode 
                  ? 'text-[#3390d5] hover:bg-gray-700 hover:text-blue-300' 
                  : 'text-[#3390d5] hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => getTransactions()}
            >
              <FiRefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
              <span>Refresh</span>
            </button>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((tx, index) => (
                <div
                  key={tx.id}
                  className={`group p-4 md:p-5 rounded-xl transition-all duration-200 cursor-pointer ${
                    darkMode 
                      ? 'bg-gray-700/50 hover:bg-gray-700 hover:shadow-lg' 
                      : 'bg-gray-50 hover:bg-gray-100 hover:shadow-md'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'deposit' 
                          ? (darkMode ? 'bg-green-500/20 ring-2 ring-green-500/30' : 'bg-green-100 ring-2 ring-green-200') 
                          : (darkMode ? 'bg-red-500/20 ring-2 ring-red-500/30' : 'bg-red-100 ring-2 ring-red-200')
                      }`}>
                        {tx.type === 'deposit' ? (
                          <FiArrowDown className={`h-6 w-6 ${
                            darkMode ? 'text-green-400' : 'text-green-600'
                          }`} />
                        ) : (
                          <FiArrowUp className={`h-6 w-6 ${
                            darkMode ? 'text-red-400' : 'text-red-600'
                          }`} />
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <p className={`text-base md:text-lg font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-800'
                        } truncate`}>
                          {tx.description || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <div className="flex items-center space-x-2">
                            <FiClock className={`h-3 w-3 ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <span className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              tx.status === 'completed' 
                                ? (darkMode ? 'bg-green-400' : 'bg-green-500')
                                : tx.status === 'pending'
                                ? (darkMode ? 'bg-yellow-400' : 'bg-yellow-500')
                                : (darkMode ? 'bg-red-400' : 'bg-red-500')
                            }`}></div>
                            <span className={`text-sm capitalize ${
                              tx.status === 'completed' 
                                ? (darkMode ? 'text-green-400' : 'text-green-600')
                                : tx.status === 'pending'
                                ? (darkMode ? 'text-yellow-400' : 'text-yellow-600')
                                : (darkMode ? 'text-red-400' : 'text-red-600')
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-lg md:text-xl font-bold ${
                        tx.type === 'deposit' 
                          ? (darkMode ? 'text-green-400' : 'text-green-600') 
                          : (darkMode ? 'text-red-400' : 'text-red-600')
                      }`}>
                        {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      {tx.status === 'completed' && (
                        <div className="flex items-center justify-end mt-1">
                          <FiCheck className={`h-4 w-4 ${
                            darkMode ? 'text-green-400' : 'text-green-500'
                          }`} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <FiClock className={`h-8 w-8 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              <p className={`text-lg font-medium ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                No transactions yet
              </p>
              <p className={`text-sm mt-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Your transaction history will appear here
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WalletOverview;