import { create } from 'zustand';
import axios from '../Api/axios';

const useBankStore = create((set) => ({
  // Initial state
  accounts: [],
  withdrawals: [],
  loading: false,
  error: null,
  selectedAccount: null,
  walletBalance: null,
  walletCurrency: null,
  bankDetails: [],
  message: null,

  // Helper function for consistent error handling
  handleError: (error, defaultMessage) => {
    let errorMessage = defaultMessage;
    
    if (error.response) {
      errorMessage = error.response.data?.message || 
                    error.response.data?.error || 
                    defaultMessage;
      
      // Special handling for specific status codes
      if (error.response.status === 400) {
        errorMessage = error.response.data.message || 'Invalid request';
      } else if (error.response.status === 402) {
        errorMessage = `Transfer failed: ${error.response.data.message}`;
      }
    }
    
    return errorMessage;
  },

  // Add bank account with loading state
  addBankAccount: async (accountDetails) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.post('/api/bank/bank-accounts', accountDetails, {
        withCredentials: true,
      });

      const newAccount = response.data.data;
      set((state) => ({
        accounts: [...state.accounts, newAccount],
        loading: false,
      }));

      return newAccount;
    } catch (error) {
      const errorMessage = get().handleError(
        error, 
        'Failed to add bank account. Please verify your details.'
      );
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Get bank accounts with loading state
  getBankAccounts: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get('/api/bank/bank-accounts', { 
        withCredentials: true 
      });

      set({
        accounts: response.data.data || [],
        loading: false,
      });
    } catch (error) {
      const errorMessage = get().handleError(error, 'Failed to fetch bank accounts');
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Withdraw to bank with detailed feedback
  withdrawToBank: async (withdrawalDetails) => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.post('/api/wallet/withdraw/bank', withdrawalDetails, {
        withCredentials: true,
      });

      const { newBalance, transactionId, estimatedArrival } = response.data.data;

      // Get full transaction details
      const transactionResponse = await axios.get(`/api/transactions/${transactionId}`, {
        withCredentials: true,
      });

      const transaction = transactionResponse.data.data;

      set((state) => ({
        withdrawals: [transaction, ...state.withdrawals],
        walletBalance: newBalance,
        loading: false,
      }));

      return {
        newBalance,
        transaction,
        estimatedArrival: new Date(estimatedArrival),
      };
    } catch (error) {
      const errorMessage = get().handleError(error, 'Withdrawal failed');
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Get wallet balance with loading state
  getWalletBalance: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get('/api/wallet', { 
        withCredentials: true 
      });

      set({
        walletBalance: response.data.balance,
        walletCurrency: response.data.currency,
        loading: false,
      });
    } catch (error) {
      const errorMessage = get().handleError(error, 'Failed to fetch wallet balance');
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Fetch bank details with proper empty state handling
  fetchBankDetails: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await axios.get('/api/wallet/bankDetails', { 
        withCredentials: true 
      });
      
      if (response.data.success && response.data.data.length === 0) {
        set({ 
          bankDetails: [], 
          message: response.data.message, 
          loading: false 
        });
      } else {
        set({ 
          bankDetails: response.data.data, 
          loading: false 
        });
      }
    } catch (error) {
      const errorMessage = get().handleError(error, 'Failed to fetch bank details');
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // State management helpers
  setSelectedAccount: (account) => set({ selectedAccount: account }),
  clearError: () => set({ error: null }),
  resetBankState: () => set({
    accounts: [],
    withdrawals: [],
    selectedAccount: null,
    walletBalance: null,
    walletCurrency: null,
    error: null,
    loading: false,
    bankDetails: [],
    message: null,
  }),
}));

export default useBankStore;