import React, { useState } from 'react';
import {
  FiMoreVertical,
  FiLink,
  FiUsers,
  FiBell,
  FiX,
  FiCheck,
  FiSettings,
  FiDollarSign,
  FiRepeat,
  FiArrowLeft
} from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import useGroupStore from '../../Store/group';
import MemberManagement from '../Message/MemberManagement';
import PayoutSwapManagement from '../Message/PayoutSwapManagement';
import { toast } from 'react-hot-toast';
import useAuthStore from "../../Store/Auth";

const RecentActivity = () => {
  const {
    currentGroup,
    leaveGroup,
    changeMemberRole,
    updateGroupSettings,
    removeGroupMember,
    initiateAutomaticPayout,
    requestPayoutSwap
  } = useGroupStore();

  const [showMembersList, setShowMembersList] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showPaymentOrderModal, setShowPaymentOrderModal] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState([]);
  const [showMemberManagement, setShowMemberManagement] = useState(false);
  const [showPayoutSwapManagement, setShowPayoutSwapManagement] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedActionMember, setSelectedActionMember] = useState(null);
  const [showPayoutConfirmation, setShowPayoutConfirmation] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [showSwapRequestModal, setShowSwapRequestModal] = useState(false);
  const [swapTargetMember, setSwapTargetMember] = useState(null);
  const [isRequestingSwap, setIsRequestingSwap] = useState(false);

  const [groupSettings, setGroupSettings] = useState({
    name: currentGroup?.name || '',
    description: currentGroup?.description || '',
    frequency: currentGroup?.frequency || 'weekly',
    savingsAmount: currentGroup?.savingsAmount || 50,
    maxMembers: currentGroup?.maxMembers || 5,
    allowLatePayments: currentGroup?.rules?.allowLatePayments || false,
    latePaymentFee: currentGroup?.rules?.latePaymentFee || 0
  });

  const currentUserId = useAuthStore.getState().user?._id;
  const isAdmin = currentGroup?.admin?._id === currentUserId;

  // Helper function to get members sorted by join date
  const getSortedMembersByJoinDate = () => {
    return [...(currentGroup?.members || [])].sort(
      (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)
    );
  };

  // Get next recipient details based on join date order
  const getNextRecipient = () => {
    const sortedMembers = getSortedMembersByJoinDate();
    if (!currentGroup?.nextRecipient) return sortedMembers[0];
    return sortedMembers.find(member => member.user._id === currentGroup.nextRecipient);
  };

  const nextRecipient = getNextRecipient();

  // Get current user's member data
  const currentUserMember = currentGroup?.members?.find(
    member => member.user._id === currentUserId
  );

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleRoleChange = async (memberId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'member' : 'admin';
      await changeMemberRole(currentGroup._id, memberId, newRole);
      toast.success(`Role changed to ${newRole}`);
    } catch (error) {
      toast.error(error.message || 'Failed to change role');
    }
  };

  const handleMemberAction = (member, type) => {
    setSelectedActionMember(member);
    setActionType(type);
    setShowActionModal(true);
  };

  const confirmMemberAction = async () => {
    try {
      if (actionType === 'role') {
        await handleRoleChange(selectedActionMember._id, selectedActionMember.role);
      } else if (actionType === 'remove') {
        await removeGroupMember(currentGroup._id, selectedActionMember._id);
        toast.success('Member removed successfully');
      }
      setShowActionModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to perform action');
    }
  };

  const handleSendRequest = () => {
    toast.success(`Request sent to ${selectedMembers.length} members`);
    setSelectedMembers([]);
  };

  const handleAssignPaymentOrder = () => {
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }
    setShowPaymentOrderModal(true);
  };

  const confirmPaymentOrder = async () => {
    try {
      await updateGroupSettings(currentGroup._id, {
        payoutOrder: [...currentGroup.payoutOrder, ...paymentOrder]
      });
      setShowPaymentOrderModal(false);
      setPaymentOrder([]);
      toast.success("Payment order updated successfully");
    } catch (error) {
      toast.error("Failed to update payment order");
    }
  };

  const copyGroupLink = () => {
    if (!currentGroup?.inviteCode) return;
    navigator.clipboard.writeText(currentGroup.inviteCode);
    toast.success('Group invite code copied to clipboard!');
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGroupSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Next payout user:', getNextRecipient());
      await updateGroupSettings(currentGroup._id, {
        name: groupSettings.name,
        description: groupSettings.description,
        frequency: groupSettings.frequency,
        savingsAmount: groupSettings.savingsAmount,
        maxMembers: groupSettings.maxMembers,
        rules: {
          allowLatePayments: groupSettings.allowLatePayments,
          latePaymentFee: groupSettings.latePaymentFee
        }
      });
      setShowSettingsModal(false);
      toast.success('Group settings updated successfully');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleInitiatePayout = async () => {
    setIsProcessingPayout(true);
    try {
      await initiateAutomaticPayout(currentGroup._id);
      toast.success('Payout processed successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to process payout');
    } finally {
      setIsProcessingPayout(false);
      setShowPayoutConfirmation(false);
    }
  };

  const handleRequestSwap = (member) => {
    // Don't allow swapping with yourself
    if (member.user._id === currentUserId) {
      toast.error("You cannot swap with yourself");
      return;
    }

    // Check if the member is already next in line
    if (currentGroup?.nextRecipient === member.user._id) {
      toast.error("This member is already next in line for payout");
      return;
    }

    setSwapTargetMember(member);
    setShowSwapRequestModal(true);
  };

  const confirmSwapRequest = async () => {
    if (!swapTargetMember) return;

    setIsRequestingSwap(true);
    try {
      await requestPayoutSwap(currentGroup._id, swapTargetMember._id);
      toast.success('Swap request sent successfully!');
      setShowSwapRequestModal(false);
    } catch (error) {
      toast.error(error.message || 'Failed to send swap request');
    } finally {
      setIsRequestingSwap(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 space-y-4">
      {showPayoutSwapManagement ? (
        <PayoutSwapManagement onBack={() => setShowPayoutSwapManagement(false)} />
      ) : showMemberManagement ? (
        <MemberManagement onBack={() => setShowMemberManagement(false)} />
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-medium">Group Setup</h2>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1"
                aria-label="More options"
              >
                <FiMoreVertical size={20} className="sm:w-6 sm:h-6" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        copyGroupLink();
                      }}
                      className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                    >
                      <FiLink className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Copy Invite Code</span>
                    </button>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          setShowSettingsModal(true);
                        }}
                        className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                      >
                        <FiSettings className="mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Group Settings</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Group Image */}
          <img
            className="h-15 w-15 rounded-full"
            src={`https://api.joinonemai.com${currentGroup?.image}`}
            alt={currentGroup?.name ?? 'Group'}
          />

          {/* Group Name */}
          <h3 className="text-center font-semibold text-sm sm:text-base">
            {currentGroup?.name || 'Loading...'}
          </h3>

          {/* Wallet Balance */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Group Wallet</p>
                <p className="font-semibold text-lg">${currentGroup?.walletBalance?.toFixed(2) || '0.00'}</p>
              </div>
              {isAdmin && currentGroup?.nextPayoutAmount > 0 && (
                <button
                  onClick={() => setShowPayoutConfirmation(true)}
                  className="bg-[#3390d5] text-white px-3 py-1 rounded text-xs sm:text-sm flex items-center gap-1"
                  disabled={isProcessingPayout}
                >
                  <FiDollarSign className="w-3 h-3" />
                  <span>Payout ${currentGroup?.nextPayoutAmount?.toFixed(2)}</span>
                </button>
              )}
            </div>

            {nextRecipient && (() => {
              return (
                <div className="mt-2 text-xs">
                  <p className="text-gray-500">Next payout to:</p>
                  <div className="flex items-center gap-3 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <img
                      src={nextRecipient?.user?.avatar || `https://ui-avatars.com/api/?name=${nextRecipient?.user?.email}&background=random`}
                      alt={nextRecipient?.user?.email}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{nextRecipient?.user?.email}</p>
                      <p className="text-xs text-gray-500">
                        {`Position #${getSortedMembersByJoinDate().findIndex(m => m.user._id === nextRecipient.user._id) + 1}`}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-green-800 bg-green-100 text-xs rounded-full">
                        Next in line
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}


          </div>

          {/* Swap Payout Position Button */}
          {currentUserMember && !isAdmin && (
            <button
              onClick={() => setShowPayoutSwapManagement(true)}
              className="w-full bg-yellow-100 text-yellow-800 font-medium py-2 rounded hover:bg-yellow-200 transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <FiRepeat size={14} />
              <span>Request Payout Position Swap</span>
            </button>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowMemberManagement(true)}
              className="flex flex-col items-center bg-gray-100 p-2 rounded hover:bg-gray-200 transition-colors"
              aria-label="Manage members"
            >
              <FiUsers className="text-gray-700 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs mt-1">Members</span>
            </button>
            <button
              onClick={() => currentGroup?._id && leaveGroup(currentGroup._id)}
              className="flex flex-col items-center bg-gray-100 p-2 rounded hover:bg-gray-200 transition-colors"
              aria-label="Leave group"
            >
              <span className="text-gray-700 text-sm sm:text-base">↩️</span>
              <span className="text-xs mt-1">Leave</span>
            </button>
            <button
              onClick={copyGroupLink}
              className="flex flex-col items-center bg-gray-100 p-2 rounded hover:bg-gray-200 transition-colors"
              aria-label="Copy group invite code"
            >
              <FiLink className="text-gray-700 w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs mt-1">Invite Code</span>
            </button>
          </div>

          {/* Conditional Rendering for Recent Activity or Members List */}
          {showMembersList ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                <h4 className="font-medium text-sm sm:text-base">Group Members</h4>
                <button
                  onClick={() => setShowMembersList(false)}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to activity
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {currentGroup?.members?.map((member) => (
                  <div
                    key={member._id}
                    className={`flex items-center gap-2 sm:gap-3 p-2 rounded-lg transition ${selectedMembers.includes(member._id)
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.name}&background=random`}
                        alt={member.user.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow"
                      />
                      {member.role === 'admin' && (
                        <FaCrown className="absolute -bottom-1 -right-1 text-yellow-500 bg-white rounded-full p-0.5 sm:p-1 w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">
                        {member.user.name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {member.role}
                      </p>
                    </div>
                    <span className={`text-2xs sm:text-xs px-2 py-0.5 sm:py-1 rounded-full ${member.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}>
                      {member.status === 'active' ? 'Online' : 'Offline'}
                    </span>

                    {isAdmin && member.user._id !== currentUserId && (
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleMemberAction(member, 'role')}
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs rounded-full ${member.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                        >
                          {member.role === 'admin' ? 'Make Member' : 'Make Admin'}
                        </button>
                        <button
                          onClick={() => handleMemberAction(member, 'remove')}
                          className="px-2 sm:px-3 py-0.5 sm:py-1 text-2xs sm:text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {currentUserMember && member.user._id !== currentUserId && (
                      <button
                        onClick={() => handleRequestSwap(member)}
                        className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 flex items-center gap-1"
                      >
                        <FiRepeat size={10} />
                        <span>Request Swap</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="space-y-3 sm:space-y-4">
                {currentGroup?.activities?.slice(0, 3).map((activity) => (
                  <div key={activity._id} className="flex items-start gap-2 sm:gap-3">
                    <div className="bg-[#3390d5] p-1 sm:p-2 rounded-full">
                      <FiBell className="text-[#3390d5] w-3 h-3 sm:w-4 sm:h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium">
                        {activity.text}
                      </p>
                      <p className="text-2xs sm:text-xs text-gray-500">
                        {new Date(activity.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          ...(window.innerWidth < 640 ? {} : {
                            day: 'numeric',
                            month: 'short'
                          })
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payout Confirmation Modal */}
          {showPayoutConfirmation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Confirm Payout</h3>
                  <button
                    onClick={() => setShowPayoutConfirmation(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="mb-4 text-sm sm:text-base">
                  <p>Are you sure you want to process the payout of <span className="font-semibold">${currentGroup?.nextPayoutAmount?.toFixed(2)}</span> to:</p>
                  <div className="flex items-center gap-3 mt-3 bg-gray-50 p-3 rounded-lg">
                    <img
                      src={nextRecipient?.user?.avatar || `https://ui-avatars.com/api/?name=${nextRecipient?.user?.name}&background=random`}
                      alt={nextRecipient?.user?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{nextRecipient?.user?.name}</p>
                      <p className="text-xs text-gray-500">Next in payout order</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowPayoutConfirmation(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    disabled={isProcessingPayout}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInitiatePayout}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-xs sm:text-sm flex items-center gap-1"
                    disabled={isProcessingPayout}
                  >
                    {isProcessingPayout ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <FiDollarSign className="w-3 h-3" />
                        Confirm Payout
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Swap Request Modal */}
          {showSwapRequestModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Request Payout Position Swap</h3>
                  <button
                    onClick={() => setShowSwapRequestModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="mb-4 text-sm sm:text-base">
                  <p>You are requesting to swap payout positions with:</p>
                  <div className="flex items-center gap-3 mt-3 bg-gray-50 p-3 rounded-lg">
                    <img
                      src={swapTargetMember?.user?.avatar || `https://ui-avatars.com/api/?name=${swapTargetMember?.user?.name}&background=random`}
                      alt={swapTargetMember?.user?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{swapTargetMember?.user?.name}</p>
                      <p className="text-xs text-gray-500">
                        Current position: {getSortedMembersByJoinDate().findIndex(m => m._id === swapTargetMember?._id) + 1 || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Your position: {getSortedMembersByJoinDate().findIndex(m => m._id === currentUserMember?._id) + 1 || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm">
                    This will send a request to {swapTargetMember?.user?.name}. They will need to approve the swap.
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowSwapRequestModal(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                    disabled={isRequestingSwap}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSwapRequest}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-xs sm:text-sm flex items-center gap-1"
                    disabled={isRequestingSwap}
                  >
                    {isRequestingSwap ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FiRepeat className="w-3 h-3" />
                        Request Swap
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Confirmation Modal */}
          {showActionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">
                    {actionType === 'role'
                      ? 'Change Member Role'
                      : 'Remove Member'}
                  </h3>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="mb-4 text-sm sm:text-base">
                  <p>
                    {actionType === 'role'
                      ? `Are you sure you want to change ${selectedActionMember?.user?.name}'s role to ${selectedActionMember?.role === 'admin' ? 'member' : 'admin'}?`
                      : `Are you sure you want to remove ${selectedActionMember?.user?.name} from the group?`}
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmMemberAction}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3390d5] text-white rounded-md hover:bg-[#3390d5] transition-colors text-xs sm:text-sm"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Order Modal */}
          {showPaymentOrderModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Assign Payment Order</h3>
                  <button
                    onClick={() => setShowPaymentOrderModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-sm sm:text-base mb-2">Selected Members:</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {selectedMembers.map(memberId => {
                      const member = currentGroup.members.find(m => m._id === memberId);
                      return (
                        <div key={memberId} className="flex items-center bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                          <span className="mr-1 sm:mr-2 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-[120px]">
                            {member?.user?.name || 'Unknown'}
                          </span>
                          <button
                            onClick={() => setPaymentOrder(prev => [...prev, memberId])}
                            className="text-green-500 hover:text-green-700 transition-colors"
                            aria-label="Add to payment order"
                          >
                            <FiCheck size={12} className="sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-sm sm:text-base mb-2">Payment Order:</h4>
                  <div className="space-y-1 sm:space-y-2">
                    {paymentOrder.length === 0 ? (
                      <p className="text-gray-500 text-xs sm:text-sm">No members added yet</p>
                    ) : (
                      paymentOrder.map((memberId, index) => {
                        const member = currentGroup.members.find(m => m._id === memberId);
                        return (
                          <div key={memberId} className="flex items-center justify-between bg-blue-50 px-2 sm:px-3 py-1 sm:py-2 rounded">
                            <div className="text-xs sm:text-sm">
                              <span className="font-medium">{index + 1}.</span> {member?.user?.name || 'Unknown'}
                            </div>
                            <button
                              onClick={() => setPaymentOrder(prev => prev.filter(id => id !== memberId))}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              aria-label="Remove from payment order"
                            >
                              <FiX size={12} className="sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowPaymentOrderModal(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPaymentOrder}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3390d5] text-white rounded-md hover:bg-[#3390d5] transition-colors text-xs sm:text-sm"
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Group Settings Modal */}
          {showSettingsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center border-b p-3 sm:p-4">
                  <h3 className="text-base sm:text-lg font-semibold">Group Settings</h3>
                  <button
                    onClick={() => setShowSettingsModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <form onSubmit={handleSettingsSubmit} className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Group Name</label>
                    <input
                      type="text"
                      name="name"
                      value={groupSettings.name}
                      onChange={handleSettingsChange}
                      className="w-full p-2 border rounded text-xs sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={groupSettings.description}
                      onChange={handleSettingsChange}
                      className="w-full p-2 border rounded text-xs sm:text-sm"
                      rows="3"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <select
                        name="frequency"
                        value={groupSettings.frequency}
                        onChange={handleSettingsChange}
                        className="w-full p-2 border rounded text-xs sm:text-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                      <input
                        type="number"
                        name="savingsAmount"
                        value={groupSettings.savingsAmount}
                        onChange={handleSettingsChange}
                        className="w-full p-2 border rounded text-xs sm:text-sm"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max Members</label>
                    <input
                      type="number"
                      name="maxMembers"
                      value={groupSettings.maxMembers}
                      onChange={handleSettingsChange}
                      className="w-full p-2 border rounded text-xs sm:text-sm"
                      required
                      min="2"
                      max="20"
                    />
                  </div>

                  <div className="pt-1 sm:pt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="allowLatePayments"
                        checked={groupSettings.allowLatePayments}
                        onChange={handleSettingsChange}
                        className="rounded border-gray-300 text-[#3390d5] focus:ring-blue-500 w-3 h-3 sm:w-4 sm:h-4"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-700">Allow Late Payments</span>
                    </label>
                  </div>

                  {groupSettings.allowLatePayments && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Late Payment Fee ($)</label>
                      <input
                        type="number"
                        name="latePaymentFee"
                        value={groupSettings.latePaymentFee}
                        onChange={handleSettingsChange}
                        className="w-full p-2 border rounded text-xs sm:text-sm"
                        min="0"
                      />
                    </div>
                  )}

                  <div className="pt-3 sm:pt-4 border-t flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSettingsModal(false)}
                      className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3390d5] text-white rounded hover:bg-[#3390d5] transition-colors flex items-center text-xs sm:text-sm"
                    >
                      <FiCheck className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Button (only show for admin) */}
          {isAdmin && (
            <button
              onClick={() => currentGroup?._id && leaveGroup(currentGroup._id)}
              className="w-full bg-red-100 text-red-600 font-medium py-2 rounded hover:bg-red-200 transition-colors text-xs sm:text-sm"
            >
              Delete Group
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default RecentActivity;