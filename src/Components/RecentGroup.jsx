import React, { useEffect, useMemo, useState } from "react";
import { FiUsers, FiCalendar, FiEye, FiPlus } from "react-icons/fi";
import Money from "../assets/money.jpeg";
import useGroupStore from "../Store/group";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import useAuthStore from "../Store/Auth";
import { toast } from "react-hot-toast";

const RecentGroup = () => {
  const {
    groups,
    fetchUserGroups,
    loading: groupLoading,
    error: groupError,
    joinGroup,
    joinGroupRoom,
    socket,
  } = useGroupStore();

  const { user } = useAuthStore();
  const [joinStatus, setJoinStatus] = useState(null);

  useEffect(() => {
    fetchUserGroups().catch(console.error);
  }, [fetchUserGroups]);

  useEffect(() => {
    if (!socket || !groups?.data?.[0]?._id) return;

    const handleRoomJoined = () => {
      setJoinStatus("joined");
      fetchUserGroups();
      toast.success("Successfully joined the group!");
    };

    const handleJoinPending = () => {
      setJoinStatus("pending");
      fetchUserGroups();
      toast.success("Join request submitted for approval");
    };

    socket.on("roomJoined", handleRoomJoined);
    socket.on("joinGroupPending", handleJoinPending);

    return () => {
      socket.off("roomJoined", handleRoomJoined);
      socket.off("joinGroupPending", handleJoinPending);
    };
  }, [socket, groups, fetchUserGroups]);

  const currentGroup = useMemo(() => groups?.data?.[0] || null, [groups]);

  const userMembership = useMemo(() => {
    if (!currentGroup?.members || !user) return null;
    return currentGroup.members.find((member) => member.user._id === user._id);
  }, [currentGroup, user]);

  const activeMembersCount = useMemo(() => {
    if (!currentGroup?.members) return 0;
    return currentGroup.members.filter(
      (member) => member.status === "active" && member.isActive
    ).length;
  }, [currentGroup]);

  const handleJoinClick = async () => {
    if (!currentGroup?._id || !user?._id) return;

    try {
      setJoinStatus("pending");
      await joinGroup(currentGroup._id);
      joinGroupRoom(currentGroup._id);
    } catch (error) {
      console.error("Failed to join group:", error);
      setJoinStatus("error");
      toast.error(
        error.response?.data?.message || "Failed to send join request"
      );
    }
  };

  if (groupLoading) {
    return (
      <div className="w-full sm:w-[240px]">
        <Skeleton height={160} />
        <Skeleton height={20} count={3} />
      </div>
    );
  }

  if (groupError) {
    return (
      <div className="w-full sm:w-[240px] p-4 bg-red-50 text-red-600 rounded-lg">
        {groupError}
      </div>
    );
  }

  // if (!currentGroup) {
  //   return (
  //     <div className="w-full sm:w-[240px] p-4 bg-gray-50 text-gray-500 rounded-lg text-center">
  //       No group available
  //     </div>
  //   );
  // }

  const renderStatusButton = () => {
    const isPendingMember = userMembership?.status === "pending";
    const isActiveMember =
      userMembership?.status === "active" && userMembership?.isActive;

    if (isActiveMember) {
      return (
        <button
          className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-[#3390d5] transition-colors"
          title="View Group"
          onClick={() => joinGroupRoom(currentGroup._id)}
        >
          <FiEye className="w-4 h-4" />
        </button>
      );
    }

    if (isPendingMember || joinStatus === "pending") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          Pending
        </span>
      );
    }

    return (
      <button
        onClick={handleJoinClick}
        className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs rounded-full shadow-md hover:opacity-90 transition-all"
        disabled={joinStatus === "pending"}
      >
        {joinStatus === "pending" ? (
          "Requesting..."
        ) : (
          <>
            <FiPlus className="mr-1" />
            Join Group
          </>
        )}
      </button>
    );
  };

  return (
    <>
      <h3 className="text-base md:text-lg font-semibold text-[#2E2E2E] dark:text-[#e2e2e2] mt-5 mb-5">
        Recent Groups
      </h3>
      <div className="flex gap-2 items-center flex-wrap">
        {groups?.map((group) => (
          <div
            key={group.id}
            className="w-full sm:w-[240px] rounded-2xl overflow-hidden shadow-lg relative bg-gradient-to-br from-white via-blue-50 to-white border border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div className="h-32 sm:h-40 w-full bg-gray-100">
              <img
                src={`https://api.joinonemai.com${group?.image}` || Money}
                alt="Savings Group"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <div className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 truncate">
                {group?.name || "Family and Friends Savings"}
              </h3>

              <div className="mb-3 sm:mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    Progress
                  </span>
                  <span className="text-xs font-semibold text-[#3390d5]">
                    {group?.progress || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full"
                    style={{ width: `${group?.progress || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-medium">
                <div className="flex items-center text-gray-500">
                  <FiUsers className="w-3 h-3 mr-1" />
                  <span>{group.members.length} members</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <FiCalendar className="w-3 h-3 mr-1" />
                  <span>{group?.daysLeft || 0} days left</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* <div className="w-full sm:w-[240px] rounded-2xl overflow-hidden shadow-lg relative bg-gradient-to-br from-white via-blue-50 to-white border border-gray-200 hover:shadow-md transition-all duration-200">
          <div className="h-32 sm:h-40 w-full bg-gray-100">
            <img
              src={currentGroup?.image || Money}
              alt="Savings Group"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="p-3 sm:p-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 truncate">
              {currentGroup?.name || "Family and Friends Savings"}
            </h3>

            <div className="mb-3 sm:mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600">
                  Progress
                </span>
                <span className="text-xs font-semibold text-[#3390d5]">
                  {currentGroup?.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full"
                  style={{ width: `${currentGroup?.progress || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs font-medium">
              <div className="flex items-center text-gray-500">
                <FiUsers className="w-3 h-3 mr-1" />
                <span>{activeMembersCount} members</span>
              </div>
              <div className="flex items-center text-gray-500">
                <FiCalendar className="w-3 h-3 mr-1" />
                <span>{currentGroup?.daysLeft || 0} days left</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default RecentGroup;
