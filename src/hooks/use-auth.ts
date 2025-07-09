
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { useUserDatabase } from './use-user-database';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  login: (credentials: Pick<User, 'email' | 'password'>) => boolean;
  logout: () => void;
  register: (userDetails: Omit<User, 'id' | 'isAdmin' | 'totalSpent' | 'valhallaCoins' | 'walletBalance' | 'premium'>) => boolean;
  updateUser: (userId: string, updates: Partial<Pick<User, 'name' | 'email'>>) => boolean;
  changePassword: (userId: string, newPassword: string) => boolean;
  updateAvatar: (userId: string, avatar: string) => void;
  updateWalletBalance: (userId: string, amount: number) => void;
  updateTotalSpent: (userId: string, amount: number) => void;
  updateValhallaCoins: (userId: string, amount: number) => void;
  subscribeToPremium: (userId: string, months?: number) => void;
  cancelSubscription: (userId: string) => void;
  updateNameStyle: (userId: string, style: string) => void;
};

const checkIsPremium = (user: User | null): boolean => {
  if (!user || !user.premium) return false;
  return user.premium.status === 'active' && new Date(user.premium.expiresAt) > new Date();
};


export const useAuth = create(
  persist<AuthState>(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isPremium: false,
      login: (credentials) => {
        const { findUser } = useUserDatabase.getState();
        const foundUser = findUser(credentials.email, credentials.password);
        if (foundUser) {
          set({ user: foundUser, isAuthenticated: true, isAdmin: !!foundUser.isAdmin, isPremium: checkIsPremium(foundUser) });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, isAdmin: false, isPremium: false });
      },
      register: (userDetails) => {
        const { findUserByEmail, addUser } = useUserDatabase.getState();
        const existingUser = findUserByEmail(userDetails.email);
        if (existingUser) {
          return false; // User already exists
        }
        const newUser: User = {
            id: `user_${Date.now()}`,
            ...userDetails,
            isAdmin: false,
            avatar: 'https://placehold.co/100x100.png',
            walletBalance: 0,
            totalSpent: 0,
            valhallaCoins: 0,
            nameStyle: 'default',
            premium: null,
        };
        addUser(newUser);
        set({ user: newUser, isAuthenticated: true, isAdmin: false, isPremium: false });
        return true;
      },
      updateUser: (userId, updates) => {
        const { updateUser } = useUserDatabase.getState();
        const success = updateUser(userId, updates);
        if (success) {
            set(state => ({ user: state.user ? { ...state.user, ...updates } : null }));
        }
        return success;
      },
      changePassword: (userId, newPassword) => {
         const { updateUser, findUserById } = useUserDatabase.getState();
         const currentUser = findUserById(userId);
         if (!currentUser) return false;
         
         const success = updateUser(userId, { password: newPassword });
         return success;
      },
      updateAvatar: (userId, avatar) => {
         const { updateUser } = useUserDatabase.getState();
         updateUser(userId, { avatar });
         set(state => ({ user: state.user ? { ...state.user, avatar } : null }));
      },
      updateWalletBalance: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
      
        if (userToUpdate) {
          const newBalance = userToUpdate.walletBalance + amount;
          updateUser(userId, { walletBalance: newBalance });
      
          const { user } = get();
          if (user && user.id === userId) {
            set({ user: { ...user, walletBalance: newBalance } });
          }
        }
      },
      updateValhallaCoins: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
        
        if (userToUpdate) {
          const newBalance = userToUpdate.valhallaCoins + amount;
          updateUser(userId, { valhallaCoins: newBalance });
      
          const { user } = get();
          if (user && user.id === userId) {
            set({ user: { ...user, valhallaCoins: newBalance } });
          }
        }
      },
      updateTotalSpent: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
      
        if (userToUpdate) {
          const newTotal = userToUpdate.totalSpent + amount;
          updateUser(userId, { totalSpent: newTotal });
      
          const { user } = get();
          if (user && user.id === userId) {
            set({ user: { ...user, totalSpent: newTotal } });
          }
        }
      },
      subscribeToPremium: (userId, months = 1) => {
        const { updateUser, findUserById } = useUserDatabase.getState();
        const currentUser = findUserById(userId);
        if (!currentUser) return;
        
        const now = new Date();
        const currentSubEnd = (currentUser.premium && new Date(currentUser.premium.expiresAt) > now) 
            ? new Date(currentUser.premium.expiresAt) 
            : now;
        
        const expiresAt = new Date(currentSubEnd.setMonth(currentSubEnd.getMonth() + months));

        const premiumData = {
          status: 'active' as const,
          subscribedAt: currentUser.premium?.subscribedAt || new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        };

        const success = updateUser(userId, { premium: premiumData });
        if (success) {
            // Award the one-time welcome bonus if this is the first subscription
            if (!currentUser.premium?.subscribedAt) {
              get().updateValhallaCoins(userId, 500);
            }
            // Update the auth state
            set(state => ({ 
              user: state.user ? { ...state.user, premium: premiumData } : null,
              isPremium: true 
            }));
        }
      },
      cancelSubscription: (userId) => {
        const { updateUser, findUserById } = useUserDatabase.getState();
        const currentUser = findUserById(userId);
        if (!currentUser || !currentUser.premium) return;

        const updatedPremiumData = { ...currentUser.premium, status: 'cancelled' as const };
        const success = updateUser(userId, { premium: updatedPremiumData });
        if (success) {
            set(state => ({
                user: state.user ? { ...state.user, premium: updatedPremiumData } : null,
            }));
        }
      },
      updateNameStyle: (userId, style) => {
         const { updateUser } = useUserDatabase.getState();
         updateUser(userId, { nameStyle: style });
         set(state => ({ user: state.user ? { ...state.user, nameStyle: style } : null }));
      },
    }),
    {
      name: 'topup-hub-auth',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as AuthState;
        if (!persisted || !persisted.user) {
            return currentState;
        }
        
        const rehydratedUser = persisted.user;
        const isNowPremium = checkIsPremium(rehydratedUser);

        return {
          ...currentState,
          ...persisted,
          isPremium: isNowPremium,
        };
      },
    }
  )
);
