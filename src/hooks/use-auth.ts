
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
  setUserState: (user: User | null) => void; // Internal helper
  login: (credentials: Pick<User, 'email' | 'password'>) => { success: boolean, message?: string };
  logout: () => void;
  register: (userDetails: Omit<User, 'id' | 'isAdmin' | 'totalSpent' | 'valhallaCoins' | 'walletBalance' | 'premium'>) => boolean;
  updateUser: (userId: string, updates: Partial<Pick<User, 'name' | 'email'>>) => boolean;
  changePassword: (userId: string, newPassword: string) => boolean;
  updateAvatar: (userId: string, avatar: string) => void;
  updateWalletBalance: (userId: string, amount: number) => void;
  updateTotalSpent: (userId: string, amount: number) => void;
  updateValhallaCoins: (userId: string, amount: number) => void;
  updateNameStyle: (userId: string, style: string) => void;
  clearWarning: (userId: string) => void;
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
      setUserState: (user) => {
        set({ user, isPremium: checkIsPremium(user) });
      },
      login: (credentials) => {
        const { findUser } = useUserDatabase.getState();
        const foundUser = findUser(credentials.email, credentials.password);

        if (!foundUser) {
            return { success: false, message: 'Invalid email or password.' };
        }
        
        // The user can log in, but the UI will handle the redirect if banned.
        set({ user: foundUser, isAuthenticated: true, isAdmin: !!foundUser.isAdmin, isPremium: checkIsPremium(foundUser) });
        return { success: true };
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
            isBanned: false,
            bannedAt: null,
            banReason: null,
            warningMessage: null,
        };
        addUser(newUser);
        set({ user: newUser, isAuthenticated: true, isAdmin: false, isPremium: false });
        return true;
      },
      updateUser: (userId, updates) => {
        const { updateUser } = useUserDatabase.getState();
        const success = updateUser(userId, updates);
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
      },
      updateWalletBalance: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
      
        if (userToUpdate) {
          const newBalance = userToUpdate.walletBalance + amount;
          updateUser(userId, { walletBalance: newBalance });
        }
      },
      updateValhallaCoins: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
        
        if (userToUpdate) {
          const newBalance = userToUpdate.valhallaCoins + amount;
          updateUser(userId, { valhallaCoins: newBalance });
        }
      },
      updateTotalSpent: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
      
        if (userToUpdate) {
          const newTotal = userToUpdate.totalSpent + amount;
          updateUser(userId, { totalSpent: newTotal });
        }
      },
      updateNameStyle: (userId, style) => {
         const { updateUser } = useUserDatabase.getState();
         updateUser(userId, { nameStyle: style });
      },
      clearWarning: (userId) => {
        const { updateUser } = useUserDatabase.getState();
        updateUser(userId, { warningMessage: null });
      },
    }),
    {
      name: 'topup-hub-auth',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as AuthState;
        if (!persisted || !persisted.user) {
            return currentState;
        }
        
        const { findUserById } = useUserDatabase.getState();
        // Get the most up-to-date user data from the central database
        const freshUser = findUserById(persisted.user.id);
        
        if (!freshUser) {
            return { ...currentState, user: null, isAuthenticated: false, isAdmin: false, isPremium: false };
        }

        return {
          ...currentState,
          ...persisted,
          user: freshUser,
          isPremium: checkIsPremium(freshUser),
          isAuthenticated: true,
          isAdmin: !!freshUser.isAdmin,
        };
      },
    }
  )
);
