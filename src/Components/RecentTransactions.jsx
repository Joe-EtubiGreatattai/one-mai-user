import React, { useEffect } from "react";
import {
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiGift,
  FiExternalLink,
  FiCreditCard,
  FiCheck,
  FiClock,
  FiX,
} from "react-icons/fi";
import useWalletStore from "../Store/useWalletStore";
import { Link } from "react-router-dom";

const RecentTransactions = () => {
  const { transactions, getTransactions, loading } = useWalletStore();

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  const getTransactionIcon = (type) => {
    const iconSize = "w-4 h-4 sm:w-5 sm:h-5";
    switch (type) {
      case "withdrawal":
        return <FiArrowUpCircle className={`text-red-500 ${iconSize}`} />;
      case "referral":
        return <FiGift className={`text-green-500 ${iconSize}`} />;
      case "deposit":
        return <FiArrowDownCircle className={`text-[#3390d5] ${iconSize}`} />;
      default:
        return <FiArrowDownCircle className={`text-purple-500 ${iconSize}`} />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <FiCheck className="w-3 h-3 text-green-500" />;
      case "pending":
        return <FiClock className="w-3 h-3 text-yellow-500" />;
      case "failed":
        return <FiX className="w-3 h-3 text-red-500" />;
      default:
        return <FiClock className="w-3 h-3 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "card":
        return <FiCreditCard className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const formatAmount = (type, amount) => {
    // Convert from cents to dollars/euros (assuming amount is in cents)
    const formattedAmount = (parseFloat(amount) / 100).toFixed(2);
    return `${type === "withdrawal" ? "-" : "+"}$${formattedAmount}`;
  };

  const formatTimelineDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatDetailedDate = (dateString) => {
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const getTransactionDescription = (transaction) => {
    const amount = formatAmount(transaction.type, transaction.amount);
    const baseDescription = transaction.description || "Transaction";
    
    switch (transaction.type) {
      case "deposit":
        return `Deposited ${amount.substring(1)} via ${transaction.paymentMethod || 'card'}`;
      case "withdrawal":
        return `Withdrew ${amount.substring(1)}`;
      case "referral":
        return `Referral bonus ${amount}`;
      default:
        return baseDescription;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-50 text-green-700 border border-green-200`;
      case "pending":
        return `${baseClasses} bg-yellow-50 text-yellow-700 border border-yellow-200`;
      case "failed":
        return `${baseClasses} bg-red-50 text-red-700 border border-red-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`;
    }
  };

  return (
    <div className="w-full rounded-lg shadow-sm overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
            Recent Transactions
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time updates for transparency and trust
          </p>
        </div>
        {transactions?.length > 0 && (
          <Link
            to="/transaction"
            className="text-xs sm:text-sm text-[#3390d5] hover:text-blue-800 flex items-center"
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

      {/* Timeline Transactions List */}
      {!loading && transactions?.length > 0 && (
        <div className="divide-y divide-gray-100">
          {transactions.slice(0, 5).map((transaction, index) => (
            <div
              key={transaction._id}
              className="p-3 sm:p-4 hover:bg-gray-50 transition-colors duration-150 relative"
            >
            
              
              <div className="flex items-start gap-3 sm:gap-4">
                {/* Timeline Icon */}
                <div className="relative z-10 p-1.5 sm:p-2 rounded-full border-2 border-gray-200 flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>

                {/* Transaction Content */}
                <div className="flex-1 min-w-0">
                  {/* Main transaction info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm sm:text-base text-gray-800">
                          {getTransactionDescription(transaction)}
                        </p>
                        <span className={getStatusBadge(transaction.status)}>
                          {getStatusIcon(transaction.status)}
                          <span className="ml-1 capitalize">{transaction.status}</span>
                        </span>
                      </div>
                      
                      {/* Timeline date */}
                      <p className="text-xs text-gray-500 mb-2">
                        {formatTimelineDate(transaction.createdAt)}
                      </p>

                      {/* Transaction details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Reference:</span>
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">
                            {transaction.reference?.split('-')[1]?.substring(0, 8) || 'N/A'}
                          </code>
                        </div>
                        
                        {transaction.paymentMethod && (
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            {getPaymentMethodIcon(transaction.paymentMethod)}
                            <span>Payment Method:</span>
                            <span className="capitalize">{transaction.paymentMethod}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <span>Time:</span>
                          <span>{formatDetailedDate(transaction.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex-shrink-0 text-right">
                      <p
                        className={`font-semibold text-sm sm:text-base ${
                          transaction.type === "withdrawal"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        {formatAmount(transaction.type, transaction.amount)}
                      </p>
                      {transaction.metadata?.payment_intent && (
                        <p className="text-xs text-gray-400 mt-1">
                          PI: {transaction.metadata.payment_intent.substring(0, 10)}...
                        </p>
                      )}
                    </div>
                  </div>
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
            className="text-xs sm:text-sm text-[#3390d5] hover:text-blue-800 font-medium inline-flex items-center"
          >
            View All Transactions <FiExternalLink className="ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;