import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ChatHeader from "../Components/Message/ChatHeader";
import MessageList from "../Components/Message/MessageList";
import MessageInput from "../Components/Message/MessageInput";
import MembersList from "../Components/Message/MembersList";
import RecentActivity from "../Components/Message/RecentActivity";
import RequestModal from "../Components/Message/RequestModal";
import useAuthStore from "../Store/Auth";
import useGroupStore from "../Store/group";
import { FaCrown } from "react-icons/fa";
import { FiShield, FiUserCheck, FiMenu, FiX, FiUsers } from "react-icons/fi";
import { useParams } from "react-router-dom";

const ChatPage = () => {
  const { groupId } = useParams();
  const { user: currentUser } = useAuthStore();
  const {
    currentGroup,
    groupMessages,
    fetchGroupMessages,
    getGroupDetails,
    initSocket,
    joinGroupRoom,
    leaveGroupRoom,
    sendMessage,
    deleteMessage,
    addGroupMembers,
    changeMemberRole,
    loading
  } = useGroupStore();

  const [message, setMessage] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState([]);
  const [socketReady, setSocketReady] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [showRoleMenu, setShowRoleMenu] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const socket = await initSocket();
        if (socket) {
          socket.on('roomJoined', () => {
            console.log('Successfully joined room');
            setSocketReady(true);
          });
          
          socket.on('joinGroupError', (error) => {
            console.error('Join group error:', error);
          });

          joinGroupRoom(groupId);
        }

        await getGroupDetails(groupId);
        await fetchGroupMessages(groupId);
      } catch (error) {
        console.error("Chat initialization error:", error);
      }
    };

    initializeChat();

    return () => {
      leaveGroupRoom(groupId);
    };
  }, [groupId]);

  // Fetch initial group data
  useEffect(() => {
    if (!groupId) return;

    const loadGroupData = async () => {
      try {
        await getGroupDetails(groupId);
        const messagesResponse = await fetchGroupMessages(groupId);
        if (messagesResponse?.data) {
          setMessages(messagesResponse.data);
        }
      } catch (error) {
        console.error("Failed to load group data:", error);
      }
    };

    loadGroupData();
  }, [groupId, getGroupDetails, fetchGroupMessages]);

  // Close mobile sidebar when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileSidebarOpen]);
 
  const handleSendMessage = async () => {
    if (!message.trim() || !socketReady) {
      console.error("Cannot send - no message or socket not ready");
      return;
    }

    try {
      const tempId = `temp-${Date.now()}`;
      
      // Optimistic update
      const tempMessage = {
        _id: tempId,
        text: message,
        sender: {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName
        },
        group: groupId,
        createdAt: new Date(),
        isOptimistic: true
      };

      setOptimisticMessages(prev => [tempMessage, ...prev]);
      setMessage("");

      // Send via store
      await sendMessage({
        groupId,
        content: message,
        tempId
      });

      // Remove optimistic message (replaced by real one)
      setOptimisticMessages(prev => prev.filter(msg => msg._id !== tempId));

    } catch (error) {
      console.error("Message send failed:", error.message);
      // Remove failed optimistic message
      setOptimisticMessages(prev => prev.filter(msg => msg._id !== tempId));
      // Optionally show error to user
      alert(`Failed to send message: ${error.message}`);
    }
  };

  const allMessages = [
    ...(groupMessages.data || []),
    ...optimisticMessages
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  // Member management
  const toggleUserSelection = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const confirmSendRequest = async () => {
    if (!selectedUsers.length) return;

    try {
      await addGroupMembers(groupId, selectedUsers);
      await handleSendMessage(
        `Sent group invitations to ${selectedUsers.length} ${
          selectedUsers.length > 1 ? "people" : "person"
        }.`
      );
      setSelectedUsers([]);
      setRequestMessage("");
      setShowRequestModal(false);
    } catch (error) {
      console.error("Failed to send invitations:", error);
    }
  };

  const changeUserRole = async (userId, newRole) => {
    try {
      await changeMemberRole(groupId, userId, newRole);
      setShowRoleMenu(null);
    } catch (error) {
      console.error("Failed to change role:", error);
    }
  };

  // UI helpers
  const copyGroupLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/groups/${groupId}/join`
    );
    alert("Group link copied to clipboard!");
    setShowMoreOptions(false);
  };

  const toggleMembersList = () => {
    setShowMembersList((prev) => {
      if (!prev) {
        setSearchTerm("");
        setSelectedUsers([]);
      }
      return !prev;
    });
  };

  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
    // Close any open menus when opening/closing sidebar
    setShowMoreOptions(false);
    setShowRoleMenu(null);
  };

  const getStatusBadge = (member) => (
    <span
      className={`${
        member.status === "pending"
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800"
      } text-xs px-2 py-1 rounded-full`}
    >
      {member.status === "pending" ? "Pending" : "Member"}
    </span>
  );

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
      default: {
        icon: <FiUserCheck className="mr-1" size={12} />,
        text: "Member",
        color: "gray",
      },
    };

    const badge = badges[role] || badges.default;
    return (
      <span
        className={`bg-${badge.color}-100 text-${badge.color}-800 text-xs px-2 py-1 rounded-full flex items-center`}
      >
        {badge.icon}
        {badge.text}
      </span>
    );
  };

  // Permission checks
  const canChangeRoles =
    currentGroup?.isAdmin ||
    currentGroup?.members?.find((m) => m._id === currentUser?._id)?.role ===
      "moderator";

  const isAdmin = currentGroup?.isAdmin;

  return (
    <div className="flex h-[81vh] md:h-[90vh] bg-[#fff] relative overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatHeader
          currentGroup={currentGroup}
          showMoreOptions={showMoreOptions}
          setShowMoreOptions={setShowMoreOptions}
          copyGroupLink={copyGroupLink}
          onToggleMembersList={handleMobileSidebarToggle}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-2 py-2 md:px-4 md:py-4 bg-white md:bg-gray-50">
          <MessageList
            groupMessages={{ data: allMessages }}
            currentUser={currentUser}
            onDeleteMessage={handleDeleteMessage}
          />
        </div>

        {/* Message Input - Fixed at bottom */}
        <div className="bg-white border-t border-gray-200 px-2 py-2 md:px-4 md:py-4 safe-area-inset-bottom">
          <MessageInput
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            isSending={loading}
            isConnected={socketReady}
          />
        </div>

        {/* Mobile Members Button - Floating */}
        <button
          className="md:hidden fixed bottom-20 left-4 z-30 bg-[#3390d5] text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-all duration-200 active:scale-95"
          onClick={handleMobileSidebarToggle}
          aria-label="Toggle group members"
        >
          <FiUsers size={20} />
          {/* Member count badge */}
          {currentGroup?.members?.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
              {currentGroup.members.length}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-80 bg-white border-l border-gray-200 overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <MembersList
            currentGroup={currentGroup}
            showMembersList={showMembersList}
            toggleMembersList={toggleMembersList}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedUsers={selectedUsers}
            toggleUserSelection={toggleUserSelection}
            sendRequestToSelectedUsers={() => setShowRequestModal(true)}
            showRoleMenu={showRoleMenu}
            setShowRoleMenu={setShowRoleMenu}
            changeUserRole={changeUserRole}
            canChangeRoles={canChangeRoles}
            isAdmin={isAdmin}
            getStatusBadge={getStatusBadge}
            getRoleBadge={getRoleBadge}
          />
        </div>

        <div className="border-t border-gray-200 flex-shrink-0">
          <RecentActivity
            currentGroup={currentGroup}
            showMoreOptions={showMoreOptions}
            setShowMoreOptions={setShowMoreOptions}
          />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform ${
          mobileSidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-out z-50 lg:hidden flex flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center space-x-2">
            <FiUsers className="text-gray-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>
          </div>
          <button
            className="p-2 -mr-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          <MembersList
            currentGroup={currentGroup}
            showMembersList={showMembersList}
            toggleMembersList={toggleMembersList}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedUsers={selectedUsers}
            toggleUserSelection={toggleUserSelection}
            sendRequestToSelectedUsers={() => setShowRequestModal(true)}
            showRoleMenu={showRoleMenu}
            setShowRoleMenu={setShowRoleMenu}
            changeUserRole={changeUserRole}
            canChangeRoles={canChangeRoles}
            isAdmin={isAdmin}
            getStatusBadge={getStatusBadge}
            getRoleBadge={getRoleBadge}
          />
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <RecentActivity
            currentGroup={currentGroup}
            showMoreOptions={showMoreOptions}
            setShowMoreOptions={setShowMoreOptions}
          />
        </div>
      </div>

      {/* Request Modal */}
      <RequestModal
        showRequestModal={showRequestModal}
        setShowRequestModal={setShowRequestModal}
        selectedUsers={selectedUsers}
        requestMessage={requestMessage}
        setRequestMessage={setRequestMessage}
        confirmSendRequest={confirmSendRequest}
      />
    </div>
  );
};

export default ChatPage;