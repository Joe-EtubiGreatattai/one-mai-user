import React, { useEffect } from "react";
import { FiArrowDownLeft, FiArrowUpLeft, FiExternalLink, FiCheck } from "react-icons/fi";
import useWalletStore from "../Store/useWalletStore";
import { Link } from "react-router-dom";

const RecentTransactions = () => {
  const { transactions, getTransactions, loading } = useWalletStore();

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  const getIcon = (type) => {
    if (type === "deposit") {
      return (
        <div className="bg-blue-100 p-2 rounded-full">
          <FiArrowDownLeft className="text-blue-500 text-lg" />
        </div>
      );
    }
    return (
      <div className="bg-green-100 p-2 rounded-full">
        <FiArrowUpLeft className="text-green-500 text-lg" />
      </div>
    );
  };

  const getTitle = (type) => (type === "deposit" ? "Deposit" : "Transaction");

  const getSubtitle = (type, method, date) => {
    const methodText = type === "deposit" ? "Card Payment" : "Manual Payment";
    const timeText = getRelativeTime(date);
    return `${methodText} • ${timeText}`;
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return `${diff} days Ago`;
  };

  const formatAmount = (type, amount) => {
    const formatted = (parseFloat(amount) / 100).toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
    });
    return `${type === "withdrawal" ? "-" : "+"}${formatted.replace("-", "")}`;
  };

  return (
    <div className="w-full rounded-lg mb-5 border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-xs text-gray-500">Real-time updates for transparency and trust</p>
        </div>
        <Link to="/transaction" className="text-sm text-blue-500 hover:underline flex items-center">
          View All <FiExternalLink className="ml-1" />
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-4 text-center text-gray-500">Loading...</div>
      )}

      {/* Empty */}
      {!loading && (!transactions || transactions.length === 0) && (
        <div className="p-4 text-center text-gray-400">No transactions yet</div>
      )}

      {/* Transactions */}
      {!loading && transactions?.length > 0 && (
        <div>
          {transactions.slice(0, 7).map((tx) => (
            <div key={tx._id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                {getIcon(tx.type)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{getTitle(tx.type)}</p>
                  <p className="text-xs text-gray-500">
                    {getSubtitle(tx.type, tx.paymentMethod, tx.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <p className="text-sm font-semibold text-green-500">{formatAmount(tx.type, tx.amount)}</p>
                <span className="flex items-center text-xs text-green-600 border border-green-300 bg-green-50 px-2 py-0.5 rounded-full">
                  <FiCheck className="mr-1" /> Completed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
