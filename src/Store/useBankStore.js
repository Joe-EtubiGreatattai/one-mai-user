import { create } from 'zustand';
import axios from '../Api/axios';

const useBankStore = create((set, get) => ({
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

  // Helper to extract error messages
  handleError: (error, defaultMessage = 'Something went wrong') => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) return error.message;
    return defaultMessage;
  },

  // Add a bank account
  addBankAccount: async (accountDetails) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.post('/api/bank/bank-accounts', accountDetails, {
        withCredentials: true,
      });

      const newAccount = res.data?.data;

      set((state) => ({
        accounts: [...state.accounts, newAccount],
        loading: false,
      }));

      return newAccount;
    } catch (err) {
      const message = get().handleError(err, 'Failed to add bank account.');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Fetch all bank accounts
  getBankAccounts: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get('/api/bank/bank-accounts', {
        withCredentials: true,
      });

      set({ accounts: res.data?.data || [], loading: false });
    } catch (err) {
      const message = get().handleError(err, 'Failed to fetch bank accounts');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Withdraw to bank
  withdrawToBank: async (withdrawalDetails) => {
    set({ loading: true, error: null });

    try {
      const res = await axios.post('/api/wallet/withdraw/bank', withdrawalDetails, {
        withCredentials: true,
      });

      const { newBalance, transactionId, estimatedArrival } = res.data?.data;

      // Fetch full transaction details
      const txRes = await axios.get(`/api/transactions/${transactionId}`, {
        withCredentials: true,
      });

      const transaction = txRes.data?.data;

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
    } catch (err) {
      const message = get().handleError(err, 'Withdrawal failed');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Get wallet balance
  getWalletBalance: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get('/api/wallet', {
        withCredentials: true,
      });

      set({
        walletBalance: res.data?.balance,
        walletCurrency: res.data?.currency,
        loading: false,
      });
    } catch (err) {
      const message = get().handleError(err, 'Failed to fetch wallet balance');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // Get linked bank details (for payouts)
  fetchBankDetails: async () => {
    set({ loading: true, error: null });

    try {
      const res = await axios.get('/api/wallet/bankDetails', {
        withCredentials: true,
      });

      if (res.data?.success && Array.isArray(res.data?.data)) {
        set({
          bankDetails: res.data.data,
          message: res.data.message || null,
          loading: false,
        });
      } else {
        set({ bankDetails: [], message: null, loading: false });
      }
    } catch (err) {
      const message = get().handleError(err, 'Failed to fetch bank details');
      set({ error: message, loading: false });
      throw new Error(message);
    }
  },

  // UI helpers
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
