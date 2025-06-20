import React, { useState } from 'react';
import { FiX, FiArrowLeft, FiRepeat } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';
import useGroupStore from '../../Store/group';
import useAuthStore from '../../Store/Auth';
import { toast } from 'react-hot-toast';

const PayoutSwapManagement = ({ onBack }) => {
  const { currentGroup, requestPayoutSwap, loading } = useGroupStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const currentUserId = useAuthStore.getState().user?._id;
  const currentUserMember = currentGroup?.members?.find(
    (member) => member.user._id === currentUserId
  );

  const getSortedMembersByJoinDate = () => {
    return [...(currentGroup?.members || [])].sort(
      (a, b) => new Date(a.joinedAt) - new Date(b.joinedAt)
    );
  };

  const filteredMembers = getSortedMembersByJoinDate().filter((member) => {
    const email = member?.user?.email?.toLowerCase() || '';
    const name = member?.user?.name?.toLowerCase() || '';
    return (
      (email.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase())) &&
      member.user._id !== currentUserId
    );
  });

  const handleRequestSwap = (member) => {
    setSelectedMember(member);
    setShowConfirmation(true);
  };

  const confirmSwapRequest = async () => {
    if (!selectedMember) return;
    try {
      await requestPayoutSwap(currentGroup._id, selectedMember._id);
      toast.success(`Swap request sent to ${selectedMember.user.name}`);
      setShowConfirmation(false);
      setSelectedMember(null);
    } catch (error) {
      toast.error(error.message || 'Failed to send swap request');
    }
  };

  const getPositionBadge = (member) => {
    const sortedMembers = getSortedMembersByJoinDate();
    const position = sortedMembers.findIndex((m) => m._id === member._id) + 1;
    const isNextRecipient = currentGroup?.nextRecipient === member.user._id;

    return (
      <span className={`text-xs px-2 py-1 rounded-full ${
        isNextRecipient
          ? 'bg-green-100 text-green-800'
          : position
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
      }`}>
        {isNextRecipient ? 'Next in line' : `Position #${position}`}
      </span>
    );
  };

  const getCurrentUserPosition = () => {
    if (!currentUserMember) return null;
    const sortedMembers = getSortedMembersByJoinDate();
    const position = sortedMembers.findIndex((m) => m._id === currentUserMember._id) + 1;
    const isNextRecipient = currentGroup?.nextRecipient === currentUserId;

    return (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium mb-1">Your Payout Position</h4>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${
            isNextRecipient
              ? 'bg-green-100 text-green-800'
              : position
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800'
          }`}>
            {isNextRecipient ? 'You are next in line' : `You are #${position} in rotation`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <FiArrowLeft size={20} />
        </button>
        <h2 className="text-lg sm:text-xl font-medium">Payout Position Swap</h2>
        <div className="w-6" />
      </div>

      {getCurrentUserPosition()}

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search members by name or email..."
        className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 transition"
      />

      <div className="space-y-3 sm:space-y-4">
        {filteredMembers?.map((member) => (
          <div key={member._id} className="flex items-center gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition">
            <div className="relative flex-shrink-0">
              <img
                src={member.user.avatar || `https://ui-avatars.com/api/?name=${member.user.name || member.user.email}&background=random`}
                alt={member.user.name}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 shadow"
              />
              {member.role === 'admin' && (
                <FaCrown className="absolute -bottom-1 -right-1 text-yellow-500 bg-white rounded-full p-0.5 sm:p-1 w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{member.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{member.user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {getPositionBadge(member)}
              </div>
            </div>
            <button
              onClick={() => handleRequestSwap(member)}
              className="px-3 py-1 text-xs sm:text-sm bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors flex items-center gap-1"
              disabled={loading}
            >
              <FiRepeat size={14} />
              <span>Request Swap</span>
            </button>
          </div>
        ))}
      </div>

      {showConfirmation && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Swap Request</h3>
              <button onClick={() => setShowConfirmation(false)} className="text-gray-500 hover:text-gray-700">
                <FiX size={20} />
              </button>
            </div>
            <div className="mb-4">
              <p>You are requesting to swap payout positions with:</p>
              <div className="flex items-center gap-3 mt-3 bg-gray-50 p-3 rounded-lg">
                <img
                  src={selectedMember.user.avatar || `https://ui-avatars.com/api/?name=${selectedMember.user.name}&background=random`}
                  alt={selectedMember.user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{selectedMember.user.name}</p>
                  <p className="text-xs text-gray-500">
                    Their position: {getSortedMembersByJoinDate().findIndex(m => m._id === selectedMember._id) + 1}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your position: {getSortedMembersByJoinDate().findIndex(m => m._id === currentUserMember._id) + 1}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm">
                This will send a request to {selectedMember.user.name}. They will need to approve the swap.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmSwapRequest}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 flex items-center gap-1"
                disabled={loading}
              >
                <FiRepeat className="w-4 h-4" />
                Confirm Swap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayoutSwapManagement;
