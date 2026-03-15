import { create } from 'zustand';

const useWalletStore = create((set) => ({
  wallet: null,
  
  setWallet: (wallet) => set({ wallet }),

  updateBalance: (balance, reserved_balance) => set((state) => ({
    wallet: state.wallet ? { ...state.wallet, balance, reserved_balance } : null,
  })),
}));

export default useWalletStore;
