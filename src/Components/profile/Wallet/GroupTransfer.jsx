import React from 'react';
import useAuthStore from '../../../Store/Auth';

const GroupTransfer = ({
  darkMode,
  groups,
  currentGroup,
  selectedGroupId,
  setSelectedGroupId,
  formData,
  handleInputChange,
  handleGroupTransfer,
  walletLoading,
  groupsLoading,
  currency
}) => {
  const { user } = useAuthStore();

  // Filter groups where the user is a member
  const getUserGroups = () => {
    if (!user || !groups.length) return [];
    return groups.filter(group => 
      group.members.some(member => member.user._id === user._id)
    );
  };

  const userGroups = getUserGroups();
  const isGroupMember = currentGroup && user 
    ? currentGroup.members.some(member => member.user._id === user._id)
    : false;

  if (groupsLoading) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Loading groups...
        </p>
      </div>
    );
  }

  if (userGroups.length === 0) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          You don't have any groups you're a member of. Please create or join a group first.
        </p>
      </div>
    );
  }

  if (!currentGroup) {
    return (
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Loading group data...
        </p>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Transfer to Group
      </h3>

      <div className="mb-4">
        <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Select Group
        </label>
        <select
          name="groupTransferId"
          value={selectedGroupId}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-opacity-50 focus:outline-none transition ${
            darkMode 
              ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
              : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'
          }`}
        >
          <option value="">Select a group</option>
          {userGroups.map(group => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {selectedGroupId && (
        <div className={`mb-4 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-white'} shadow-sm`}>
          <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {currentGroup.name}
          </h4>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
            Members: {currentGroup.members?.length || 0}
          </p>
          {!isGroupMember && (
            <p className="text-yellow-500 mt-2 text-sm">
              Note: You are not a member of this group and won't receive payouts.
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleGroupTransfer}>
        <div className="mb-4">
          <label className={`block mb-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Amount ({currency})
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg focus:ring focus:ring-opacity-50 focus:outline-none transition ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500' 
                : 'bg-white border-gray-300 text-gray-800 focus:ring-blue-500'
            }`}
            placeholder="Enter amount"
            min="1"
            step="0.01"
            required
            disabled={!selectedGroupId}
          />
        </div>

        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg font-medium transition flex items-center justify-center ${
            darkMode 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } ${walletLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={walletLoading || !isGroupMember || !selectedGroupId}
        >
          {walletLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            selectedGroupId ? `Transfer to ${currentGroup.name}` : 'Select a group first'
          )}
        </button>

        {!isGroupMember && selectedGroupId && (
          <p className="text-red-500 mt-2 text-sm text-center md:text-left">
            You must be a member of this group to transfer funds.
          </p>
        )}
      </form>
    </div>
  );
};

export default GroupTransfer;