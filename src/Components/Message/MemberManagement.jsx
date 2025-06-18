import React, { useState } from 'react';
import { FiX, FiCheck, FiArrowLeft, FiUser, FiShield, FiUserCheck, FiDollarSign } from 'react-icons/fi';
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
      toast.success(`Payout processed successfully for ${memberId}`);
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

      {/* Search Bar */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search members..."
        className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
      />

      {/* Member List */}
      <div className="space-y-3 sm:space-y-4">
        {filteredMembers?.map((member) => (
          <div
            key={member._id}
            className={`flex items-center gap-3 p-2 sm:p-3 rounded-lg transition ${
              selectedMembers.includes(member._id)
                ? 'bg-blue-50 border border-blue-200'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="relative flex-shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${member.user.email.split('@')[0]}&background=random`}
                alt={member.user.email}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow"
              />
              {selectedMembers.includes(member._id) && (
                <div className="absolute -top-1 -right-1 bg-[#3390d5] text-white rounded-full p-0.5 sm:p-1">
                  <FiCheck size={10} className="sm:w-3 sm:h-3" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{member.user.email.split('@')[0]}</p>
              <div className="flex items-center gap-2 mt-1">
                {isAdmin ? getRoleBadge("admin") : getRoleBadge("member")}
                {isAdmin && member.role !== 'admin' && (
                  <div className="relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setRoleMenuOpen(roleMenuOpen === member._id ? null : member._id);
                      }}
                      className="text-gray-400 hover:text-[#3390d5] p-1 transition-colors"
                      aria-label="Change role"
                    >
                      <FiUser size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    {roleMenuOpen === member._id && (
                      <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <button
                          onClick={() => handleRoleChange(member._id, 'admin')}
                          className="flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                        >
                          <FaCrown className="mr-2 text-purple-500 w-3 h-3 sm:w-4 sm:h-4" /> Make Admin
                        </button>
                        <button
                          onClick={() => handleRoleChange(member._id, 'moderator')}
                          className="flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                        >
                          <FiShield className="mr-2 text-[#3390d5] w-3 h-3 sm:w-4 sm:h-4" /> Make Moderator
                        </button>
                        <button
                          onClick={() => handleRoleChange(member._id, 'member')}
                          className="flex items-center px-3 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                        >
                          <FiUserCheck className="mr-2 text-gray-500 w-3 h-3 sm:w-4 sm:h-4" /> Make Member
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <button
                    onClick={() => toggleMemberSelection(member._id)}
                    className="p-1 text-gray-400 hover:text-[#3390d5] transition-colors"
                    aria-label={selectedMembers.includes(member._id) ? "Deselect member" : "Select member"}
                  >
                    {selectedMembers.includes(member._id) ? (
                      <FiX size={16} className="text-red-500 sm:w-5 sm:h-5" />
                    ) : (
                      <FiCheck size={16} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handlePayout(member._id)}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    title="Payout"
                    aria-label="Process payout"
                  >
                    <FiDollarSign size={16} className="sm:w-5 sm:h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Members Actions */}
      {selectedMembers.length > 0 && isAdmin && (
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-2 sm:mb-3">
            Selected Members ({selectedMembers.length}):
          </h4>
          <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
            {selectedMembers.map((memberId) => {
              const member = currentGroup.members.find((m) => m._id === memberId);
              return (
                <div key={memberId} className="flex items-center bg-gray-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                  <span className="mr-1 sm:mr-2 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                    {member?.user?.email.split('@')[0] || 'Unknown'}
                  </span>
                  <button
                    onClick={() => toggleMemberSelection(memberId)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    aria-label="Remove from selection"
                  >
                    <FiX size={12} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                selectedMembers.forEach(memberId => {
                  handleRoleChange(memberId, 'admin');
                });
              }}
              className="flex items-center px-3 py-1.5 sm:py-2 bg-[#3390d5] text-white rounded hover:bg-[#3390d5] transition-colors text-xs sm:text-sm"
              disabled={loading}
            >
              <FiShield className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Make Admin
            </button>
            <button
              onClick={() => {
                selectedMembers.forEach(memberId => {
                  handleRoleChange(memberId, 'member');
                });
              }}
              className="flex items-center px-3 py-1.5 sm:py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-xs sm:text-sm"
              disabled={loading}
            >
              <FiUserCheck className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Make Members
            </button>
            <button
              onClick={handleBulkPayout}
              className="flex items-center px-3 py-1.5 sm:py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-xs sm:text-sm"
              disabled={loading}
            >
              <FiDollarSign className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" /> Payout Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;