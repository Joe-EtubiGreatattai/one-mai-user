import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../Api/axios";
import { io } from "socket.io-client";
import useAuthStore from "./Auth";
import { toast } from "react-hot-toast";
const useGroupStore = create(
  persist(
    (set, get) => ({
      groups: [],
      currentGroup: null,
      groupMessages: {
        success: false,
        count: 0,
        data: [],
      },
      payoutHistory: [],
      joinRequests: [],
      loading: false,
      error: null,
      allgroups: [],
      successMessage: null,
      socket: null,

      // Ensure socket is connected
      ensureSocketConnection: async () => {
        const { socket } = get();
        if (socket?.connected) return socket;

        // Try to reconnect
        try {
          const newSocket = get().initSocket();
          if (newSocket) {
            // Wait for connection or timeout
            await new Promise((resolve, reject) => {
              if (newSocket.connected) {
                resolve();
                return;
              }

              const onConnect = () => {
                newSocket.off("connect", onConnect);
                resolve();
              };

              const onError = (err) => {
                newSocket.off("connect_error", onError);
                reject(err);
              };

              newSocket.on("connect", onConnect);
              newSocket.on("connect_error", onError);

              // Timeout after 5 seconds
              setTimeout(() => {
                newSocket.off("connect", onConnect);
                newSocket.off("connect_error", onError);
                reject(new Error("Socket connection timeout"));
              }, 5000);
            });

            return newSocket;
          }
        } catch (error) {
          console.error("Reconnection error:", error);
          throw error;
        }

        throw new Error("Failed to establish socket connection");
      },


      // Initialize socket connection
      initSocket: () => {
        try {
          const user = useAuthStore.getState().user;
          if (!user) return;

          // Disconnect existing socket if any
          if (get().socket) {
            get().socket.disconnect();
          }

          const socket = io("https://api.joinonemai.com", {
            transports: ["websocket"],
            query: { userId: user._id }
          });

          // Add all event listeners here
          socket.on('connect', () => {
            console.log('Socket connected');
            set({ socketReady: true });
          });

          socket.on('disconnect', () => {
            console.log('Socket disconnected');
            set({ socketReady: false });
          });

          socket.on('newMessage', (message) => {
            console.log('New message received:', message);
            set(state => ({
              groupMessages: {
                ...state.groupMessages,
                data: [message, ...state.groupMessages.data]
              }
            }));
          });

          socket.on('error', (error) => {
            console.error('Socket error:', error);
          });

          set({ socket });
          return socket;
        } catch (error) {
          console.error('Socket init error:', error);
          return null;
        }
      },

      // Send message with proper error handling
      sendMessage: async ({ groupId, content, tempId }) => {
        const { socket } = get();
        if (!socket) {
          toast.error('Socket connection not established');
          throw new Error('Socket not connected');
        }

        try {
          return await new Promise((resolve, reject) => {
            // Set timeout for the acknowledgement
            const timeout = setTimeout(() => {
              reject(new Error('Message send timeout'));
            }, 10000); // 10 seconds timeout

            socket.emit('sendMessage',
              { groupId, content, tempId },
              (response) => {
                clearTimeout(timeout); // Clear the timeout

                if (response?.error) {
                  reject(new Error(response.error));
                } else if (!response?.success) {
                  reject(new Error('Failed to send message'));
                } else {
                  resolve(response.message);
                }
              }
            );
          });
        } catch (error) {
          console.error('Message send error:', error);
          toast.error(error.message || 'Failed to send message');
          throw error;
        }
      },
      //ge group message 
      fetchGroupMessages: async (groupId) => {
        set({ loading: true });
        try {
          const response = await axios.get(`/api/group/${groupId}/messages`);
          set({
            groupMessages: {
              success: true,
              data: response.data.data,
              count: response.data.count
            }
          });
          return response.data;
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to fetch messages");
          throw error;
        } finally {
          set({ loading: false });
        }
      },


      // Join group room
      joinGroupRoom: (groupId) => {
        const { socket } = get();
        if (socket) {
          socket.emit("joinGroupRoom", groupId);
        }
      },

      // Leave group room
      leaveGroupRoom: (groupId) => {
        const { socket } = get();
        if (socket) {
          socket.emit("leaveGroupRoom", groupId);
        }
      },

      // Send message

      fetchGroupByInviteCode: async (code) => {
        set({ loading: true });
        try {
          const response = await axios.get(`/api/group/invite/${code}`);
          const group = response.data.group;

          if (!group) throw new Error("Group not found");

          return group;
        } catch (error) {
          const message = error.response?.data?.message || "Invalid or expired invite code";
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ loading: false });
        }
      },

      // Add this method to the useGroupStore
      requestPayoutSwap: async (groupId, recipientId) => {
        set({ loading: true });
        console.log("[requestPayoutSwap] Initiating payout swap request", { groupId, recipientId });
        try {
          const response = await axios.post(
        `/api/group/${groupId}/request_payout_order_swap`,
        { recipient: recipientId }
          );
          console.log("[requestPayoutSwap] API response:", response.data);

          toast.success(response.data.message || "Swap request sent successfully");
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to send swap request";
          console.error("[requestPayoutSwap] Error:", error, "Message:", errorMessage);
          toast.error(errorMessage);
          throw new Error(errorMessage);
        } finally {
          set({ loading: false });
          console.log("[requestPayoutSwap] Loading state set to false");
        }
      },
      // Delete message
      deleteMessage: async (messageId) => {
        const { socket } = get();
        if (!socket) {
          toast.error("Socket connection not established");
          return;
        }

        try {
          await new Promise((resolve, reject) => {
            socket.emit("deleteMessage", { messageId }, (response) => {
              if (response?.error) {
                reject(response.error);
              } else {
                resolve(response);
              }
            });

            setTimeout(() => {
              reject(new Error("Delete message timeout"));
            }, 5000);
          });
        } catch (error) {
          toast.error(error.message || "Failed to delete message");
          throw error;
        }
      },

      joinGroupWithCode: async (inviteCode) => {
        set({ loading: true });
        try {
          const response = await axios.post('/api/group/join', {
            invite_code: inviteCode
          });

          if (response.data.message === "Group not found") {
            throw new Error("Group not found");
          }

          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || error.message || "Failed to join group";
          set({ error: message });
          throw new Error(message);
        } finally {
          set({ loading: false });
        }
      },

      // Disconnect socket
      disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
          socket.disconnect();
          set({ socket: null });
        }
      },

      // Group management methods
      createGroup: async (formData) => {
        set({ loading: true });
        try {
          const response = await axios.post(
            "/api/group/createGroup",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          set((state) => ({
            groups: [...state.groups, response.data],
            currentGroup: response.data,
          }));

          toast.success("Group created successfully");
          return response.data;
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to create group"
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      fetchUserGroups: async () => {
        set({ loading: true });
        try {
          const response = await axios.get("/api/group");
          set({ groups: response.data.data });
          return response.data;
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to fetch groups"
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      getGroupDetails: async (groupId) => {
        set({ loading: true });
        try {
          const response = await axios.get(`/api/group/${groupId}`);
          const groupData = response.data.data;

          set({
            currentGroup: {
              ...groupData,
              nextPayoutAmount:
                groupData.savingsAmount * groupData.members.length,
              isAdmin:
                groupData.admin._id === useAuthStore.getState().user?._id,
            },
          });

          return groupData;
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to fetch group details"
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      updateGroup: async (groupId, updateData) => {
        set({ loading: true });
        try {
          const response = await axios.put(`/api/group/${groupId}`, updateData);

          set((state) => ({
            groups: state.groups.map((group) =>
              group._id === groupId ? response.data : group
            ),
            currentGroup: response.data,
          }));

          toast.success("Group updated successfully");
          return response.data;
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to update group"
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      deleteGroup: async (groupId) => {
        set({ loading: true });
        try {
          await axios.delete(`/api/group/${groupId}`);

          set((state) => ({
            groups: state.groups.filter((group) => group._id !== groupId),
            currentGroup: null,
          }));

          toast.success("Group deleted successfully");
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to delete group"
          );
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // In your group store (e.g., useGroupStore.js
      // In your useGroupStore.js
      updateMemberStatus: async (groupId, memberId, status) => {
        set({ loading: true, error: null });

        try {
          const { socket } = get();
          if (!socket) {
            throw new Error('Socket connection not available');
          }

          // Optimistic update
          set(state => ({
            groups: state.groups.map(group =>
              group._id === groupId
                ? {
                  ...group,
                  members: group.members.map(member =>
                    member.user._id === memberId
                      ? { ...member, status, isActive: status === 'active' }
                      : member
                  )
                }
                : group
            ),
            currentGroup: state.currentGroup?._id === groupId
              ? {
                ...state.currentGroup,
                members: state.currentGroup.members.map(member =>
                  member.user._id === memberId
                    ? { ...member, status, isActive: status === 'active' }
                    : member
                )
              }
              : state.currentGroup
          }));

          // Send request via socket
          const response = await new Promise((resolve, reject) => {
            socket.emit('updateMemberStatus',
              { groupId, memberId, status },
              (response) => {
                if (response.error) {
                  reject(new Error(response.error));
                } else {
                  resolve(response);
                }
              }
            );

            setTimeout(() => {
              reject(new Error('Status update timeout'));
            }, 10000);
          });

          toast.success(`Member status updated to ${status}`);
          return response;

        } catch (error) {
          // Revert optimistic update
          set(state => ({
            groups: state.groups,
            currentGroup: state.currentGroup,
            loading: false,
            error: error.message
          }));

          toast.error(error.message);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Add this to handle incoming status updates
      updateMemberState: (groupId, memberId, status) => {
        set(state => ({
          groups: state.groups.map(group =>
            group._id === groupId
              ? {
                ...group,
                members: group.members.map(member =>
                  member.user._id === memberId
                    ? { ...member, status, isActive: status === 'active' }
                    : member
                )
              }
              : group
          ),
          currentGroup: state.currentGroup?._id === groupId
            ? {
              ...state.currentGroup,
              members: state.currentGroup.members.map(member =>
                member.user._id === memberId
                  ? { ...member, status, isActive: status === 'active' }
                  : member
              )
            }
            : state.currentGroup
        }));
      },

      removeGroupMember: async (groupId, memberId) => {
        set({ loading: true });
        try {
          await axios.delete(`/api/group/${groupId}/members/${memberId}`);
          set((state) => ({
            currentGroup: {
              ...state.currentGroup,
              members: state.currentGroup.members.filter(
                (m) => m._id !== memberId
              ),
              payoutOrder: state.currentGroup.payoutOrder.filter(
                (id) => id !== memberId
              ),
            },
            loading: false,
            successMessage: "Member removed successfully",
          }));
          get()._clearMessages();
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to remove member",
            loading: false,
          });
          throw error;
        }
      },

      changeMemberRole: async (groupId, memberId, role) => {
        set({ loading: true });
        try {
          const response = await axios.patch(
            `/api/group/${groupId}/members/${memberId}/role`,
            { role }
          );
          set((state) => ({
            currentGroup: {
              ...state.currentGroup,
              members: state.currentGroup.members.map((member) =>
                member._id === memberId ? { ...member, role } : member
              ),
            },
            loading: false,
            successMessage: "Member role updated",
          }));
          get()._clearMessages();
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to change role",
            loading: false,
          });
          throw error;
        }
      },

      leaveGroup: async (groupId) => {
        set({ loading: true });
        try {
          await axios.post(`/api/group/${groupId}/leave`);
          set((state) => ({
            groups: state.groups.filter((group) => group._id !== groupId),
            currentGroup: null,
            loading: false,
            successMessage: "Successfully left the group",
          }));
          get()._clearMessages();
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to leave group",
            loading: false,
          });
          throw error;
        }
      },

      joinGroup: async (groupId) => {
        set({ loading: true });
        try {
          const response = await axios.post(`/api/group/${groupId}/join`);

          // Handle different response scenarios
          if (response.data.message === 'Already a group member') {
            set({
              loading: false,
              error: 'You are already a member of this group'
            });
            toast.error('You are already a member of this group');
            return;
          }

          if (response.data.message === 'Join request already pending') {
            set({
              loading: false,
              error: 'You already have a pending join request for this group'
            });
            toast.error('You already have a pending join request for this group');
            return;
          }

          if (response.data.requiresApproval) {
            set({
              loading: false,
              successMessage: 'Join request submitted for admin approval'
            });
            toast.success('Join request submitted for admin approval');

            // Add to pending requests in state if needed
            set(state => ({
              pendingJoinRequests: [
                ...state.pendingJoinRequests,
                {
                  groupId,
                  groupName: response.data.group?.name || '',
                  requestedAt: new Date().toISOString(),
                  status: 'pending'
                }
              ]
            }));

            return response.data;
          }

          // If no approval needed (immediate join)
          set(state => ({
            groups: [...state.groups, response.data.group],
            loading: false,
            successMessage: 'Successfully joined group'
          }));
          toast.success('Successfully joined group');

          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to join group';
          set({
            error: errorMessage,
            loading: false
          });
          toast.error(errorMessage);
          throw error;
        } finally {
          // Clear messages after delay
          setTimeout(() => {
            set({ error: null, successMessage: null });
          }, 5000);
        }
      },

      updateGroupSettings: async (groupId, settings) => {
        set({ loading: true });
        try {
          const response = await axios.patch(
            `/api/group/${groupId}/settings`,
            settings
          );
          set((state) => ({
            currentGroup: {
              ...state.currentGroup,
              ...response.data,
            },
            loading: false,
            successMessage: "Group settings updated",
          }));
          get()._clearMessages();
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to update settings",
            loading: false,
          });
          throw error;
        }
      },

      initiateAutomaticPayout: async (groupId) => {
        set({ loading: true });
        try {
          const response = await axios.post(
            `/api/group/${groupId}/payouts/auto`
          );
          set((state) => ({
            currentGroup: {
              ...state.currentGroup,
              nextPayoutDate: response.data.nextPayoutDate,
              currentPayoutIndex: response.data.nextPayoutIndex,
              payouts: [...state.currentGroup.payouts, response.data.payout],
            },
            loading: false,
            successMessage: "Payout processed successfully",
          }));
          get()._clearMessages();
          return response.data;
        } catch (error) {
          set({
            error: error.response?.data?.message || "Failed to process payout",
            loading: false,
          });
          throw error;
        }
      },

      fetchPayoutHistory: async (groupId) => {
        set({ loading: true });
        try {
          const response = await axios.get(`/api/group/${groupId}/payouts`);
          set({
            payoutHistory: response.data,
            loading: false,
          });
          return response.data;
        } catch (error) {
          set({
            error:
              error.response?.data?.message || "Failed to fetch payout history",
            loading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      clearSuccessMessage: () => set({ successMessage: null }),
      resetGroupState: () =>
        set({
          groups: [],
          currentGroup: null,
          groupMessages: [],
          payoutHistory: [],
          joinRequests: [],
          loading: false,
          error: null,
          successMessage: null,
        }),

      _clearMessages: () => {
        setTimeout(() => {
          set({ successMessage: null, error: null });
        }, 5000);
      },
    }),
    {
      name: "group-storage",
      partialize: (state) => ({
        groups: state.groups,
        currentGroup: state.currentGroup,
      }),
    }
  )
);

export default useGroupStore;
