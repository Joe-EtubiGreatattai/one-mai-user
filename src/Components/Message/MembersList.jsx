import React from 'react';
import { FiUser, FiUserPlus, FiCheck, FiSettings, FiCopy } from 'react-icons/fi';
import { FaCrown } from 'react-icons/fa';

const MembersList = ({
  currentGroup,
  showMembersList,
  toggleMembersList,
  searchTerm,
  setSearchTerm,
  selectedUsers,
  toggleUserSelection,
  sendRequestToSelectedUsers,
  showRoleMenu,
  setShowRoleMenu,
  changeUserRole,
  canChangeRoles,
  isAdmin,
  getStatusBadge,
  getRoleBadge
}) => {
  const filteredMembers = currentGroup?.members?.filter(member =>
    member?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border-b border-gray-200">
      {showMembersList && currentGroup?.members && (
        <div className="mb-4">
          {/* Search Input */}
          <div className="relative mb-3">
            <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
            />
          </div>
          
          {/* Selected Users Actions */}
          {selectedUsers.length > 0 && (
            <div className="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <span className="text-xs sm:text-sm text-gray-600">
                {selectedUsers.length} {selectedUsers.length > 1 ? 'users' : 'user'} selected
              </span>
              <button
                onClick={sendRequestToSelectedUsers}
                className="flex items-center justify-center text-xs sm:text-sm bg-[#3390d5] text-white px-3 py-1 rounded-lg hover:bg-[#3390d5] transition-colors"
              >
                <FiUserPlus className="mr-1 w-3 h-3 sm:w-4 sm:h-4" /> 
                <span>Send Request</span>
              </button>
            </div>
          )}
          
          {/* Members List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredMembers.map((member) => (
              <div 
                key={member._id} 
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  selectedUsers.includes(member._id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => setShowRoleMenu(null)}
              >
                <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                  {member.status === 'pending' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserSelection(member._id);
                      }}
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded border flex-shrink-0 ${
                        selectedUsers.includes(member._id) 
                          ? 'bg-[#3390d5] border-blue-500 text-white' 
                          : 'border-gray-300'
                      }`}
                      aria-label={selectedUsers.includes(member._id) ? "Deselect user" : "Select user"}
                    >
                      {selectedUsers.includes(member._id) && (
                        <FiCheck size={12} className="mx-auto w-2 h-2 sm:w-3 sm:h-3" />
                      )}
                    </button>
                  )}
                  <div className="relative flex-shrink-0">
                    <img 
                      src={member.avatar || `https://randomuser.me/api/portraits/${member._id % 2 === 0 ? 'men' : 'women'}/${member._id.slice(-2)}.jpg`}
                      alt={member.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                    />
                    {member.status === 'active' && (
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full border border-white"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                      {member.name}
                    </p>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <p className="text-2xs sm:text-xs text-gray-500 truncate">
                        {member.status === 'active' ? 'Online' : 'Offline'}
                      </p>
                      {getStatusBadge(member)}
                      {member.role && getRoleBadge(member.role)}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  {member.status === 'active' && canChangeRoles && (
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRoleMenu(showRoleMenu === member._id ? null : member._id);
                        }}
                        className="text-gray-400 hover:text-[#3390d5] transition-colors p-0.5"
                        aria-label="Change role"
                      >
                        <FiSettings size={14} className="sm:w-4 sm:h-4" />
                      </button>
                      {showRoleMenu === member._id && (
                        <div className="absolute right-0 mt-2 w-36 sm:w-40 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              changeUserRole(member._id, 'admin');
                            }}
                            className="flex items-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                          >
                            <FaCrown className="mr-2 text-purple-500 w-3 h-3 sm:w-4 sm:h-4" /> 
                            <span>Make Admin</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              changeUserRole(member._id, 'moderator');
                            }}
                            className="flex items-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                          >
                            <FiShield className="mr-2 text-[#3390d5] w-3 h-3 sm:w-4 sm:h-4" /> 
                            <span>Make Moderator</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              changeUserRole(member._id, 'member');
                            }}
                            className="flex items-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-50 w-full text-left transition-colors"
                          >
                            <FiUserCheck className="mr-2 text-gray-500 w-3 h-3 sm:w-4 sm:h-4" /> 
                            <span>Make Member</span>
                          </button>
                          {member.role === 'admin' && isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                changeUserRole(member._id, 'member');
                              }}
                              className="flex items-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-red-50 w-full text-left border-t border-gray-200 transition-colors"
                            >
                              <FiX className="mr-2 w-3 h-3 sm:w-4 sm:h-4" /> 
                              <span>Remove Admin</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(member._id);
                    }}
                    className="text-gray-400 hover:text-[#3390d5] transition-colors p-0.5"
                    aria-label="Copy user ID"
                  >
                    <FiCopy size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  {member.status === 'pending' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleUserSelection(member._id);
                      }}
                      className="text-gray-400 hover:text-green-500 transition-colors p-0.5"
                      aria-label="Add user"
                    >
                      <FiUserPlus size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;