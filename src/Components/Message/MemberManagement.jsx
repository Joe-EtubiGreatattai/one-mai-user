import React, { useState } from 'react';
import { FiX, FiCheck, FiArrowLeft, FiUser, FiShield, FiUserCheck, FiDollarSign, FiClock, FiCalendar } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import useGroupStore from '../../Store/group';
import useAuthStore from '../../Store/Auth';
import { toast } from 'react-hot-toast';

const MemberManagement = ({ onBack }) => {
  const { currentGroup, changeMemberRole, loading, processPayout } = useGroupStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [roleMenuOpen, setRoleMenuOpen] = useState(null);
  
  // Get current user ID and check if admin
  const currentUserId = useAuthStore.getState().user?._id;
  const isAdmin = currentGroup?.admin?._id === currentUserId || currentGroup?.isAdmin;

  // Helper function to check if user has paid for current cycle
  const getPaymentStatus = (userId) => {
    if (!currentGroup?.contributions) return { paid: false, amount: 0 };
    
    const userContribution = currentGroup.contributions.find(
      contrib => contrib.userId === userId && contrib.cycle === currentGroup.currentCycle
    );
    
    return {
      paid: !!userContribution,
      amount: userContribution?.amount || 0
    };
  };

  // Helper function to check if user is next recipient
  const isNextRecipient = (userId) => {
    return currentGroup?.nextRecipient === userId;
  };

  // Helper function to get user's position in payout order
  const getPayoutPosition = (userId) => {
    const position = currentGroup?.payoutOrder?.indexOf(userId);
    return position !== -1 ? position + 1 : null;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleMemberSelection = (memberId) => {
    if (!isAdmin) {
      toast.error('Only admins can select members.');
      return;
    }
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await changeMemberRole(currentGroup._id, memberId, newRole);
      toast.success(`Role changed to ${newRole}`);
      setRoleMenuOpen(null);
    } catch (error) {
      toast.error(error.message || 'Failed to change role');
    }
  };

  const handlePayout = async (memberId) => {
    try {
      await processPayout(currentGroup._id, memberId);
      toast.success(`Payout processed successfully`);
    } catch (error) {
      toast.error(error.message || 'Failed to process payout');
    }
  };

  const handleBulkPayout = async () => {
    try {
      for (const memberId of selectedMembers) {
        await processPayout(currentGroup._id, memberId);
      }
      toast.success(`Payouts processed for ${selectedMembers.length} members`);
      setSelectedMembers([]);
    } catch (error) {
      toast.error(error.message || 'Failed to process payouts');
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: {
        icon: <FaCrown className="mr-1" size={12} />,
        text: "Admin",
        color: "purple",
      },
      moderator: {
        icon: <FiShield className="mr-1" size={12} />,
        text: "Moderator",
        color: "blue",
      },
      member: {
        icon: <FiUserCheck className="mr-1" size={12} />,
        text: "Member",
        color: "gray",
      },
    };

    const badge = badges[role] || badges.member;
    return (
      <span
        className={`bg-${badge.color}-100 text-${badge.color}-800 text-xs px-2 py-1 rounded-full flex items-center`}
      >
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  const filteredMembers = currentGroup?.members?.filter((member) =>
    member?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button 
          onClick={onBack} 
          className="text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Go back"
        >
          <FiArrowLeft size={20} className="sm:w-6 sm:h-6" />
        </button>
        <h2 className="text-lg sm:text-xl font-medium">Member Management</h2>
        <div className="w-6" /> {/* Spacer for alignment */}
      </div>

      {/* Group Info Summary */}
      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-sm">
          <div>
            <p className="text-gray-600 font-medium">Group</p>
            <p className="text-gray-800 truncate">{currentGroup?.name}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Cycle</p>
            <p className="text-gray-800">{currentGroup?.currentCycle}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Amount</p>
            <p className="text-gray-800">${currentGroup?.savingsAmount}</p>
          </div>
          <div>
            <p className="text-gray-600 font-medium">Wallet</p>
            <p className="text-gray-800">${currentGroup?.walletBalance}</p>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Next Payout:</span>
            <span className="text-gray-800 font-medium">
              {formatDate(currentGroup?.nextPayoutDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search members by email..."
        className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
      />

      {/* Member List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredMembers?.map((member) => {
          const paymentStatus = getPaymentStatus(member.user._id);
          const isNextRecip = isNextRecipient(member.user._id);
          const payoutPosition = getPayoutPosition(member.user._id);

          return (
            <div
              key={member._id}
              className={`p-3 sm:p-4 rounded-lg border-2 transition ${
                selectedMembers.includes(member._id)
                  ? 'bg-blue-50 border-blue-200'
                  : isNextRecip
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              {/* Main Member Info Row */}
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <img
                    src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.email.split('@')[0]}&background=random`}
                    alt={member.user.email}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow"
                  />
                  {selectedMembers.includes(member._id) && (
                    <div className="absolute -top-1 -right-1 bg-[#3390d5] text-white rounded-full p-1">
                      <FiCheck size={12} className="sm:w-3 sm:h-3" />
                    </div>
                  )}
                  {member.status === 'active' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {member.user.email}
                    </p>
                    {isNextRecip && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                        Next Recipient
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {getRoleBadge(member.role || "member")}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      member.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member.status === 'active' ? 'Active' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => toggleMemberSelection(member._id)}
                        className={`p-2 rounded-full transition-colors ${
                          selectedMembers.includes(member._id)
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        aria-label={selectedMembers.includes(member._id) ? "Deselect member" : "Select member"}
                      >
                        {selectedMembers.includes(member._id) ? (
                          <FiX size={16} className="sm:w-5 sm:h-5" />
                        ) : (
                          <FiCheck size={16} className="sm:w-5 sm:h-5" />
                        )}
                      </button>
                      
                      {member.role !== 'admin' && (
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setRoleMenuOpen(roleMenuOpen === member._id ? null : member._id);
                            }}
                            className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Change role"
                          >
                            <FiUser size={16} className="sm:w-5 sm:h-5" />
                          </button>
                          {roleMenuOpen === member._id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                              <button
                                onClick={() => handleRoleChange(member._id, 'admin')}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                              >
                                <FaCrown className="mr-2 text-purple-500 w-4 h-4" /> Make Admin
                              </button>
                              <button
                                onClick={() => handleRoleChange(member._id, 'moderator')}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                              >
                                <FiShield className="mr-2 text-[#3390d5] w-4 h-4" /> Make Moderator
                              </button>
                              <button
                                onClick={() => handleRoleChange(member._id, 'member')}
                                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                              >
                                <FiUserCheck className="mr-2 text-gray-500 w-4 h-4" /> Make Member
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={() => handlePayout(member._id)}
                        className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-full transition-colors"
                        title="Process Payout"
                        aria-label="Process payout"
                      >
                        <FiDollarSign size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Payment and Additional Info Row */}
              <div className="pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                  {/* Payment Status */}
                  <div className="flex items-center gap-2">
                    <FiDollarSign className={`w-4 h-4 ${paymentStatus.paid ? 'text-green-500' : 'text-red-500'}`} />
                    <div>
                      <p className={`font-medium ${paymentStatus.paid ? 'text-green-700' : 'text-red-700'}`}>
                        {paymentStatus.paid ? 'Paid' : 'Unpaid'}
                      </p>
                      {paymentStatus.paid && (
                        <p className="text-gray-500 text-xs">
                          ${paymentStatus.amount}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payout Position */}
                  {payoutPosition && (
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600 font-medium">
                          Position #{payoutPosition}
                        </p>
                        <p className="text-gray-500 text-xs">
                          in queue
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Join Date */}
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600 font-medium">
                        Joined
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(member.joinedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Members Actions */}
      {selectedMembers.length > 0 && isAdmin && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-3 text-sm sm:text-base">
            Selected Members ({selectedMembers.length}):
          </h4>
          
          {/* Selected Members List */}
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedMembers.map((memberId) => {
              const member = currentGroup.members.find((m) => m._id === memberId);
              return (
                <div key={memberId} className="flex items-center bg-white px-3 py-1.5 rounded-full border border-gray-200">
                  <span className="mr-2 text-sm truncate max-w-[100px] sm:max-w-[150px]">
                    {member?.user?.email.split('@')[0] || 'Unknown'}
                  </span>
                  <button
                    onClick={() => toggleMemberSelection(memberId)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove from selection"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                selectedMembers.forEach(memberId => {
                  handleRoleChange(memberId, 'admin');
                });
              }}
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
              disabled={loading}
            >
              <FaCrown className="mr-2 w-4 h-4" /> Make Admin
            </button>
            <button
              onClick={() => {
                selectedMembers.forEach(memberId => {
                  handleRoleChange(memberId, 'moderator');
                });
              }}
              className="flex items-center px-4 py-2 bg-[#3390d5] text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              disabled={loading}
            >
              <FiShield className="mr-2 w-4 h-4" /> Make Moderator
            </button>
            <button
              onClick={() => {
                selectedMembers.forEach(memberId => {
                  handleRoleChange(memberId, 'member');
                });
              }}
              className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              disabled={loading}
            >
              <FiUserCheck className="mr-2 w-4 h-4" /> Make Members
            </button>
            <button
              onClick={handleBulkPayout}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              disabled={loading}
            >
              <FiDollarSign className="mr-2 w-4 h-4" /> Payout Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;