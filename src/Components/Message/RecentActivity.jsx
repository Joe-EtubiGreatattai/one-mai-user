import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import {
  FiLink,
  FiUsers,
  FiBell,
  FiX,
  FiCheck,
  FiRepeat,
  FiArrowLeft,
  FiCalendar,
  FiInfo,
  FiPlus,
  FiDollarSign
} from 'react-icons/fi';
import { FaCrown, FaEuroSign, FaHandHoldingUsd } from 'react-icons/fa';
import useGroupStore from '../../Store/group';
import MemberManagement from '../Message/MemberManagement';
import PayoutSwapManagement from '../Message/PayoutSwapManagement';
import { toast } from 'react-hot-toast';
import useAuthStore from "../../Store/Auth";
import DepositWithdraw from '../../Components/profile/Wallet/DepositWithdraw';
import axios from 'axios';

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51RUUUSP8EVNH0Oikg8cTjV51i1Iy1p3WL9HOUyCejRoumJYpRMpJJvmhTqV9anMgzpwzeKwwVr7lPg7kqQZ7cIat005cGwt8P1");

const ContributeForm = ({ currentGroup, setIsProcessing, onClose }) => {
  const elements = useElements();
  const stripe = useStripe();
  const token = useAuthStore.getState().accessToken;

  const handleContribute = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const response = await axios.post(
        `https://api.joinonemai.com/api/wallet/group/${currentGroup._id}/contribute`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.clientSecret) {
        const cardElement = elements.getElement(CardElement);

        const { error } = await stripe.confirmCardPayment(response.data.clientSecret, {
          payment_method: {
            card: cardElement,
          },
          return_url: `${window.location.origin}${window.location.pathname}?payment=completed`,
        });

        if (error) {
          throw new Error(error.message);
        } else {
          toast.success('Contribution successful!');
          onClose();
        }
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process contribution');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded p-3">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button
        onClick={handleContribute}
        className="w-full bg-[#00C9A7] text-white font-medium py-3 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2"
      >
        Contribute Now
      </button>
    </div>
  );
};

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
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [formData, setFormData] = useState({ amount: '', selectedAccount: '' });
  const [amountError, setAmountError] = useState('');
  const [isProcessingContribution, setIsProcessingContribution] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount" && amountError) setAmountError("");
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateAmount = () => {
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setAmountError('Please enter a valid amount');
      return false;
    }
    setAmountError('');
    return true;
  };

  const getReturnUrl = () => {
    return `${window.location.origin}${window.location.pathname}?payment=completed`;
  };

  const handleDepositSuccess = () => {
    setShowDepositModal(false);
    setFormData({ amount: '', selectedAccount: '' });
    setAmountError('');
    toast.success('Deposit successful! Group wallet updated.');
    if (window.refreshGroupData) {
      window.refreshGroupData();
    }
  };

  const handleWithdraw = (e) => {
    e.preventDefault();
    toast.error('Withdrawal is not available in group context');
  };

  // Helper function to get members sorted by join date
  const getSortedMembersByJoinDate = () => {
    return [...(currentGroup?.members || [])].sort(
      (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)
    );
  };

  // Get next recipient details based on nextRecipient field
  const getNextRecipient = () => {
    if (!currentGroup?.nextRecipient) return null;
    return currentGroup.members?.find(member => member.user._id === currentGroup.nextRecipient);
  };

  const nextRecipient = getNextRecipient();

  // Get current user's member data
  const currentUserMember = currentGroup?.members?.find(
    member => member.user._id === currentUserId
  );

  // Get member position in payout order
  const getMemberPayoutPosition = (userId) => {
    const payoutOrder = currentGroup?.payoutOrder || [];
    const position = payoutOrder.indexOf(userId);
    return position >= 0 ? position + 1 : null;
  };

  // Format next payout date
  const formatNextPayoutDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get frequency display text
  const getFrequencyText = (frequency) => {
    const frequencyMap = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly'
    };
    return frequencyMap[frequency] || frequency;
  };

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
      const token = useAuthStore.getState().accessToken;
      const groupId = currentGroup?._id;

      if (!groupId) {
        throw new Error("Group ID not found");
      }

      const response = await axios.post(
        `https://api.joinonemai.com/api/wallet/group/${groupId}/payout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        const { recipientAmount, affiliateCommission, transactionId } = response.data.data;
        toast.success(
          `Payout processed successfully! Recipient: €${recipientAmount}, Affiliate Commission: €${affiliateCommission}, Transaction ID: ${transactionId}`
        );
      } else {
        throw new Error(response.data?.message || "Failed to process payout");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to process payout");
    } finally {
      setIsProcessingPayout(false);
      setShowPayoutConfirmation(false);
    }
  };


  const handleRequestSwap = (member) => {
    if (member.user._id === currentUserId) {
      toast.error("You cannot swap with yourself");
      return;
    }

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
          {/* Group Image */}
          <div className="flex justify-center">
            <img
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-4 border-gray-100 shadow-md"
              src={`https://api.joinonemai.com${currentGroup?.image}`}
              alt={currentGroup?.name ?? 'Group'}
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentGroup?.name || 'Group')}&background=random&size=96`;
              }}
            />
          </div>

          {/* Group Name and Description */}
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg sm:text-xl text-gray-800">
              {currentGroup?.name || 'Loading...'}
            </h3>
            {currentGroup?.description && (
              <p className="text-sm text-gray-600 max-w-xs mx-auto">
                {currentGroup.description}
              </p>
            )}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <FiUsers className="w-3 h-3" />
                {currentGroup?.members?.length || 0}/{currentGroup?.maxMembers || 0} members
              </span>
              <span className="flex items-center gap-1">
                <FiCalendar className="w-3 h-3" />
                {getFrequencyText(currentGroup?.frequency)} - €{currentGroup?.savingsAmount || 0}
              </span>
            </div>
          </div>

          {/* Group Stats Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Wallet Balance */}
            <div className="bg-[#3390d5] p-3 rounded-lg border border-[#3390d5]">
              <div className="text-center">
                <p className="text-xs text-white font-medium">Group Wallet</p>
                <p className="font-bold text-lg text-white">
                  €{currentGroup?.walletBalance?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-white mt-1">
                  Total: €{currentGroup?.totalContributions?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {/* Next Payout */}
            <div className="bg-[#00C9A7] p-3 rounded-lg border border-green-100">
              <div className="text-center">
                <p className="text-xs text-white font-medium">Next Payout</p>
                <p className="font-bold text-lg text-white">
                  €{currentGroup?.nextPayoutAmount?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-white mt-1">
                  {formatNextPayoutDate(currentGroup?.nextPayoutDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Current Cycle & Status */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="text-gray-600">Cycle:</span>
                <span className="font-semibold ml-1">{currentGroup?.currentCycle || 1}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${currentGroup?.status === 'active'
                  ? 'bg-[#00C9A7] text-white'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {currentGroup?.status || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

     

          {/* Payout and Deposit Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShowContributeModal(true)}
              className="bg-[#00C9A7] text-white font-medium py-3 rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2"
            >
              {isProcessingContribution ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <FaHandHoldingUsd size={16} />
                  <span>Contribute</span>
                </>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowPayoutConfirmation(true)}
                className="bg-[#3390d5] text-white font-medium py-3 rounded-lg hover:bg-[#2980b9] transition-colors text-sm flex items-center justify-center gap-2"
                disabled={!nextRecipient || currentGroup?.nextPayoutAmount <= 0}
              >
                <FaEuroSign size={16} />
                <span>Payout</span>
              </button>
            )}
          </div>

          {/* Next Recipient Info */}
          {nextRecipient && (
            <div className="p-3 rounded-lg">
              <p className="text-xs text-black font-medium mb-2">Next payout recipient:</p>
              <div className="flex items-center gap-3 bg-white p-2 rounded-lg">
                <img
                  src={nextRecipient?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nextRecipient?.user?.email)}&background=random&size=32`}
                  alt={nextRecipient?.user?.email}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{nextRecipient?.user?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 text-white bg-[#00C9A7] text-xs rounded-full">
                      Next in line
                    </span>
                    {getMemberPayoutPosition(nextRecipient.user._id) && (
                      <span className="text-xs text-gray-500">
                        Position #{getMemberPayoutPosition(nextRecipient.user._id)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Swap Payout Position Button */}
          {currentUserMember && !isAdmin && (
            <button
              onClick={() => setShowPayoutSwapManagement(true)}
              className="w-full bg-[#3390d5] text-white font-medium py-2 rounded hover:bg-[#3390d5] transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
            >
              <FiRepeat size={14} />
              <span>Request Payout Position Swap</span>
            </button>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowMemberManagement(true)}
              className="flex flex-col items-center bg-[#003E7B] p-3 rounded hover:bg-[#003E7B] transition-colors"
              aria-label="Manage members"
            >
              <FiUsers className="text-white w-5 h-5" />
              <span className="text-xs mt-1 text-white font-medium">Members</span>
            </button>
            <button
              onClick={() => currentGroup?._id && leaveGroup(currentGroup._id)}
              className="flex flex-col items-center bg-[#003E7B] p-3 rounded hover:bg-[#003E7B] transition-colors"
              aria-label="Leave group"
            >
              <FiArrowLeft className="text-white w-5 h-5" />
              <span className="text-xs mt-1 text-white font-medium">Leave</span>
            </button>
            <button
              onClick={copyGroupLink}
              className="flex flex-col items-center bg-[#003E7B] p-3 rounded hover:bg-[#003E7B] transition-colors"
              aria-label="Copy group invite code"
            >
              <FiLink className="text-white w-5 h-5" />
              <span className="text-xs mt-1 text-white font-medium">Invite</span>
            </button>
          </div>

          {/* Members List or Recent Activity */}
          {showMembersList ? (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 gap-2">
                <h4 className="font-medium text-sm sm:text-base">Group Members ({currentGroup?.members?.length || 0})</h4>
                <button
                  onClick={() => setShowMembersList(false)}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to activity
                </button>
              </div>

              <div className="space-y-3">
                {currentGroup?.members?.map((member) => (
                  <div
                    key={member._id}
                    className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition ${selectedMembers.includes(member._id)
                      ? 'bg-[#3390d5] border-[#3390d5]'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={member.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.email)}&background=random&size=40`}
                          alt={member.user.email}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                        />
                        {member.user._id === currentGroup?.admin?._id && (
                          <FaCrown className="absolute -bottom-1 -right-1 text-yellow-500 bg-white rounded-full p-0.5 w-4 h-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {member.user.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${member.status === 'active'
                            ? 'bg-[#00C9A7] text-white'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {member.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                          {getMemberPayoutPosition(member.user._id) && (
                            <span className="text-xs text-gray-500">
                              Position #{getMemberPayoutPosition(member.user._id)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined: {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end sm:justify-start">
                      {isAdmin && member.user._id !== currentUserId && (
                        <>
                          <button
                            onClick={() => handleMemberAction(member, 'role')}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors whitespace-nowrap"
                          >
                            {member.user._id === currentGroup?.admin?._id ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button
                            onClick={() => handleMemberAction(member, 'remove')}
                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors whitespace-nowrap"
                          >
                            Remove
                          </button>
                        </>
                      )}

                      {currentUserMember && member.user._id !== currentUserId && (
                        <button
                          onClick={() => handleRequestSwap(member)}
                          className="px-2 py-1 text-xs bg-[#F4E8D0] text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors flex items-center gap-1 whitespace-nowrap"
                        >
                          <FiRepeat size={12} />
                          <span>Swap</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">Recent Activity</h4>
                <button
                  onClick={() => setShowMembersList(true)}
                  className="text-xs text-[#3390d5] hover:text-[#3390d5]"
                >
                  View all members
                </button>
              </div>

              <div className="space-y-3">
                {currentGroup?.activities?.length > 0 ? (
                  currentGroup.activities.slice(0, 3).map((activity) => (
                    <div key={activity._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-[#3390d5] p-1.5 rounded-full">
                        <FiBell className="text-white w-3 h-3" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.text}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FiInfo className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                    <p className="text-xs mt-1">Activity will appear here as members contribute and receive payouts</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contribution Modal */}
          {showContributeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Contribute to Group</h3>
                  <button
                    onClick={() => setShowContributeModal(false)}
                    className="text-gray-600 hover:text-black"
                  >
                    ×
                  </button>
                </div>

                <Elements stripe={stripePromise}>
                  <ContributeForm
                    currentGroup={currentGroup}
                    setIsProcessing={setIsProcessingContribution}
                    onClose={() => setShowContributeModal(false)}
                  />
                </Elements>
              </div>
            </div>
          )}

          {/* Deposit Modal */}
          {showDepositModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Deposit to Group Wallet</h3>
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Close modal"
                  >
                    <FiX size={20} className="sm:w-6 sm:h-6" />
                  </button>
                </div>

                <DepositWithdraw
                  darkMode={false}
                  activeTab="deposit"
                  formData={formData}
                  handleInputChange={handleInputChange}
                  validateAmount={validateAmount}
                  amountError={amountError}
                  stripePromise={stripePromise}
                  walletLoading={false}
                  accounts={[]}
                  bankLoading={false}
                  handleWithdraw={handleWithdraw}
                  currency="EUR"
                  getReturnUrl={getReturnUrl}
                />
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
                  <p>Are you sure you want to process the payout of <span className="font-semibold">€{currentGroup?.nextPayoutAmount?.toFixed(2)}</span> to:</p>
                  <div className="flex items-center gap-3 mt-3 bg-gray-50 p-3 rounded-lg">
                    <img
                      src={nextRecipient?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(nextRecipient?.user?.email)}&background=random&size=40`}
                      alt={nextRecipient?.user?.email}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{nextRecipient?.user?.email}</p>
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
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#00C9A7] text-white rounded-md hover:bg-green-600 transition-colors text-xs sm:text-sm flex items-center gap-1"
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
                        <FaEuroSign className="w-3 h-3" />
                        Confirm Payout
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Group Settings Modal */}
          {showSettingsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Amount (€)</label>
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
                        className="rounded border-gray-300 text-[#3390d5] focus:ring-[#3390d5] w-3 h-3 sm:w-4 sm:h-4"
                      />
                      <span className="ml-2 text-xs sm:text-sm text-gray-700">Allow Late Payments</span>
                    </label>
                  </div>

                  {groupSettings.allowLatePayments && (
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Late Payment Fee (€)</label>
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
                      className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3390d5] text-white rounded hover:bg-[#2980b9] transition-colors flex items-center text-xs sm:text-sm"
                    >
                      <FiCheck className="mr-1 w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
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
                      src={swapTargetMember?.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(swapTargetMember?.user?.email)}&background=random&size=40`}
                      alt={swapTargetMember?.user?.email}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium">{swapTargetMember?.user?.email}</p>
                      <p className="text-xs text-gray-500">
                        Current position: {getMemberPayoutPosition(swapTargetMember?.user?._id) || 'Not set'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Your position: {getMemberPayoutPosition(currentUserMember?.user?._id) || 'Not set'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm">
                    This will send a request to {swapTargetMember?.user?.email}. They will need to approve the swap.
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
                      ? `Are you sure you want to change ${selectedActionMember?.user?.email}'s role?`
                      : `Are you sure you want to remove ${selectedActionMember?.user?.email} from the group?`}
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
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3390d5] text-white rounded-md hover:bg-[#2980b9] transition-colors text-xs sm:text-sm"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RecentActivity;