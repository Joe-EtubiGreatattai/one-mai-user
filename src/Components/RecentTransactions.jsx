import React, { useEffect } from "react";
import {
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiGift,
  FiExternalLink,
} from "react-icons/fi";
import useWalletStore from "../Store/useWalletStore";
import { Link } from "react-router-dom";

const RecentTransactions = () => {
  const { transactions, getTransactions, loading } = useWalletStore();

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  const getTransactionIcon = (type) => {
    const iconSize = "w-4 h-4 sm:w-5 sm:h-5"; // Responsive icon sizing
    switch (type) {
      case "withdrawal":
        return <FiArrowUpCircle className={`text-red-500 ${iconSize}`} />;
      case "referral":
        return <FiGift className={`text-green-500 ${iconSize}`} />;
      case "deposit":
        return <FiArrowDownCircle className={`text-blue-500 ${iconSize}`} />;
      default:
        return <FiArrowDownCircle className={`text-purple-500 ${iconSize}`} />;
    }
  };

  const formatAmount = (type, amount) => {
    const formattedAmount = parseFloat(amount).toFixed(2);
    return `${type === "withdrawal" ? "-" : "+"}$${formattedAmount}`;
  };

  const formatDate = (dateString) => {
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 ">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
          Recent Transactions
        </h3>
        {transactions?.length > 0 && (
          <Link
            to="/profile"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            View All <FiExternalLink className="ml-1" />
          </Link>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-4 sm:p-6 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && (!transactions || transactions.length === 0) && (
        <div className="p-4 sm:p-6 text-center">
          <div className="text-gray-400 mb-2">
            <FiArrowUpCircle className="mx-auto h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm">
            No transactions yet
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Your transactions will appear here
          </p>
        </div>
      )}

      {/* Transactions List */}
      {!loading && transactions?.length > 0 && (
        <div className="divide-y divide-gray-100 max-h-80 sm:max-h-96 overflow-y-auto">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction._id}
              className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                {/* Icon and Description */}
                <div className="flex items-center min-w-0 flex-1">
                  <div className="p-1 sm:p-2 rounded-full bg-gray-100 mr-2 sm:mr-3 flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm sm:text-base text-gray-800 truncate">
                      {transaction.description || "Transaction"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Amount */}
                <div className="flex-shrink-0">
                  <p
                    className={`font-semibold text-xs sm:text-sm ${
                      transaction.type === "withdrawal"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}
                  >
                    {formatAmount(transaction.type, transaction.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {!loading && transactions?.length > 5 && (
        <div className="p-2 sm:p-3 border-t border-gray-100 text-center bg-gray-50">
          <Link
            to="/transactions"
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
          >
            View All Transactions <FiExternalLink className="ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
