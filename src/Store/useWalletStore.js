import { create } from 'zustand';
import axios from '../Api/axios';
import useAuthStore from './Auth';
import useBankStore from './useBankStore';

const useWalletStore = create((set, get) => ({
  // User Wallet State
  balance: 0,
  currency: 'USD',
  loading: false,
  error: null,
  transactions: [],
  cards: [],
  deposits: [],
  bankAccounts: [],
  walletConnected: false,

  // Helper function for consistent error handling
  handleError: (error, defaultMessage) => {
    return error.response?.data?.message || defaultMessage;
  },

  // Initialize wallet with auth integration
  initializeWallet: async () => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      const response = await axios.get('/api/wallet', {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      
      set({ 
        balance: response.data.data.balance,
        currency: response.data.data.currency || 'USD',
        walletConnected: true,
        loading: false 
      });
      
      // Also fetch bank accounts if wallet is initialized
      await get().getBankAccounts();
    } catch (error) {
      const errorMessage = get().handleError(error, 'Failed to load wallet');
      set({ error: errorMessage, loading: false, walletConnected: false });
    }
  },

  // Get transactions with pagination
  getTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/api/wallet/transactions`, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      
      // Now response.data.data is directly the transactions array
      set({ 
        transactions: Array.isArray(response.data.data) 
          ? response.data.data 
          : [],
        loading: false 
      });
    } catch (error) {
      const errorMessage = get().handleError(error, 'Failed to load transactions');
      set({ error: errorMessage, loading: false });
    }
  },

  // Deposit funds with Stripe integration
  // Updated deposit function in your wallet store
  // In your useWalletStore.js
  // In your useWalletStore.js
  deposit: async ({ amount, paymentMethod, token, returnUrl }) => {
    set({ loading: true, error: null });
    
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');

      // Validate amount on server side as well
      if (!amount || isNaN(amount) || amount < 1) {
        throw new Error('Valid amount (minimum 1) is required');
      }

      const response = await axios.post('/api/wallet/deposit', { 
        amount, 
        paymentMethod: paymentMethod || 'card',
        token,
        returnUrl,
        userId: user._id
      }, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`
        }
      });

      set(state => ({
        balance: response.data.data.newBalance,
        transactions: Array.isArray(state.transactions) 
          ? [response.data.data.transaction, ...state.transactions]
          : [response.data.data.transaction],
        loading: false
      }));

      return response.data;
    } catch (error) {
      let errorMessage = 'Deposit failed';
      if (error.response?.data?.error?.includes('amount')) {
        errorMessage = 'Valid amount (minimum 1) is required';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  // Withdraw funds with bank integration
  withdraw: async (amountOrData, bankAccountId) => {
    set({ loading: true, error: null });
    
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      // Handle both parameter styles
      const payload = typeof amountOrData === 'object'
        ? {
            amount: amountOrData.amount,
            bankAccountId: amountOrData.bankAccountId,
            userId: user._id
          }
        : {
            amount: amountOrData,
            bankAccountId,
            userId: user._id
          };
      
      const response = await axios.post('/api/wallet/withdraw', payload, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      
      set(state => ({
        balance: response.data.data.newBalance,
        transactions: Array.isArray(state.transactions)
          ? [response.data.data.transaction, ...state.transactions]
          : [response.data.data.transaction],
        loading: false
      }));
      
      useBankStore.getState().getWalletBalance();
      
      return response.data;
    } catch (error) {
      const errorMessage = get().handleError(error, 'Withdrawal failed');
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
  
  transferToGroup: async ({ groupId, amount }) => {
    set({ loading: true, error: null });
    
    try {
      const { user, accessToken } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      const response = await axios.post(
        `/api/wallet/groups/${groupId}/contribute`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      set((state) => ({
        balance: response.data.userBalance, // or calculate: state.balance - amount
        transactions: Array.isArray(state.transactions)
          ? [...state.transactions] // optionally push new one here
          : [],
        loading: false,
      }));
  
      return response.data;
    } catch (error) {
      const errorMessage = get().handleError(error, 'Group transfer failed');
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Add payment card with validation
  addCard: async (cardDetails) => {
    set({ loading: true, error: null });
    
    try {
      const { user } = useAuthStore.getState();
      if (!user) throw new Error('User not authenticated');
      
      const response = await axios.post('/api/wallet/cards', {
        ...cardDetails,
        userId: user._id
      }, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      
      set(state => ({
        cards: [...state.cards, response.data.data.card],
        loading: false
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = get().handleError(error, 'Failed to add card');
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Get deposit history with filters
  getDepositHistory: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/wallet/deposits?${query}`, {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      set({ 
        deposits: response.data.data,
        loading: false 
      });
    } catch (error) {
      const errorMessage = get().handleError(error, 'Failed to load deposits');
      set({ error: errorMessage, loading: false });
    }
  },

  // Get bank accounts with auth integration
  getBankAccounts: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/wallet/bankDetails', {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().accessToken}`
        }
      });
      set({ 
        bankAccounts: response.data.data,
        loading: false 
      });
    } catch (error) {
      const errorMessage = get().handleError(error, 'Failed to load bank accounts');
      set({ error: errorMessage, loading: false });
    }
  },

  // Transfer to group wallet (integration with group store)

  // Clear wallet state when logging out
  clearWallet: () => set({ 
    balance: 0,
    transactions: [],
    cards: [],
    deposits: [],
    bankAccounts: [],
    walletConnected: false,
    error: null,
    loading: false 
  }),

  // Sync with auth store on logout
  syncWithAuth: () => {
    const { user } = useAuthStore.getState();
    if (!user) {
      get().clearWallet();
    }
  }
}));

// Subscribe to auth store changes
useAuthStore.subscribe(
  (state) => state.user,
  (user) => {
    if (!user) {
      useWalletStore.getState().clearWallet();
    } else {
      useWalletStore.getState().initializeWallet();
    }
  }
);

export default useWalletStore;