import React, { useEffect, useState } from 'react';
import { FiSearch, FiCalendar, FiMail, FiUser } from 'react-icons/fi';
import { FaCrown, FaEuroSign } from 'react-icons/fa';
import useReferralStore from "../Store/useReferralStore";

function Referrals() {
  const { referralData, fetchMyReferrals } = useReferralStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredReferrals, setFilteredReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchMyReferrals();
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError('Failed to load referral data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchMyReferrals]);

  useEffect(() => {
    if (referralData?.referrals) {
      if (!searchTerm) {
        setFilteredReferrals(referralData.referrals);
      } else {
        const filtered = referralData.referrals.filter(referral => 
          (referral.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          referral.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          referral.status?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredReferrals(filtered);
      }
    }
  }, [searchTerm, referralData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading referrals</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">Please try again or contact support if the problem persists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">My Referrals</h1>
        {referralData?.affiliateStats && (
          <div className="bg-blue-50 p-2 sm:p-3 rounded-lg w-full sm:w-auto">
            <p className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-1">
              My Referral Code:
              <span className="font-mono bg-[#3390d5] px-2 py-1 rounded text-xs sm:text-sm">
                {referralData.affiliateStats.referralCode}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {referralData?.affiliateStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm text-gray-500">Total Referrals</h3>
            <p className="text-xl sm:text-2xl font-bold">{referralData.affiliateStats.totalReferrals}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm text-gray-500">Active Referrals</h3>
            <p className="text-xl sm:text-2xl font-bold">{referralData.affiliateStats.activeReferrals}</p>
          </div>
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            <h3 className="text-xs sm:text-sm text-gray-500">Total Earnings</h3>
            <p className="text-xl sm:text-2xl font-bold flex items-center">
              <FaEuroSign className="mr-1" />
              {referralData.affiliateStats.totalBonusEarned || 0}
            </p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Referrals Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bonus</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReferrals.length > 0 ? (
                filteredReferrals.map((referral) => (
                  <tr key={referral.referralId} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <FiUser className="text-gray-500 text-sm sm:text-base" />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">
                        {referral.user.name}
                      </div>
                      <div className="text-xs text-gray-500 sm:hidden">
                        {referral.user.email}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                        <FiMail className="mr-1 hidden sm:inline" /> 
                        {referral.user.email}
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-500 flex items-center">
                        <FiCalendar className="mr-1" /> 
                        {formatDate(referral.user.joinDate)}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-green-600">
                        ${referral.bonusAmount}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        referral.status === 'active' ? 'bg-green-100 text-green-800' : 
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-xs sm:text-sm text-gray-500">
                    {referralData?.referrals?.length > 0
                      ? 'No referrals match your search.'
                      : 'You have no referrals yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Referrals;