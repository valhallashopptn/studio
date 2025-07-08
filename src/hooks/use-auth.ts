'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: Pick<User, 'email' | 'password'>) => boolean;
  logout: () => void;
  register: (userDetails: Omit<User, 'id' | 'isAdmin' | 'totalSpent'>) => boolean;
  updateUser: (userId: string, updates: Partial<Pick<User, 'name' | 'email'>>) => boolean;
  changePassword: (userId: string, newPassword: string) => boolean;
  updateAvatar: (userId: string, avatar: string) => void;
  updateWalletBalance: (userId: string, amount: number) => void;
  updateTotalSpent: (userId: string, amount: number) => void;
};

// Mock users database
let users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@topuphub.com', password: 'admin', isAdmin: true, avatar: 'https://placehold.co/100x100.png', walletBalance: 1000, totalSpent: 0 },
    { id: '2', name: 'Test User', email: 'user@topuphub.com', password: 'user', isAdmin: false, avatar: 'https://placehold.co/100x100.png', walletBalance: 50, totalSpent: 250 },
    { id: '3', name: 'Jane Smith', email: 'jane.smith@example.com', password: 'password123', isAdmin: false, avatar: 'https://placehold.co/100x100.png', walletBalance: 25.50, totalSpent: 25.50 },
];

export const useAuth = create(
  persist<AuthState>(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      login: (credentials) => {
        const foundUser = users.find(u => u.email === credentials.email && u.password === credentials.password);
        if (foundUser) {
          set({ user: foundUser, isAuthenticated: true, isAdmin: !!foundUser.isAdmin });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, isAuthenticated: false, isAdmin: false });
      },
      register: (userDetails) => {
        const existingUser = users.find(u => u.email === userDetails.email);
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
        };
        users.push(newUser);
        set({ user: newUser, isAuthenticated: true, isAdmin: false });
        return true;
      },
      updateUser: (userId, updates) => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            set(state => ({ user: state.user ? { ...state.user, ...updates } : null }));
            return true;
        }
        return false;
      },
      changePassword: (userId, newPassword) => {
         const userIndex = users.findIndex(u => u.id === userId);
         if (userIndex > -1) {
             users[userIndex].password = newPassword;
             return true;
         }
         return false;
      },
      updateAvatar: (userId, avatar) => {
         const userIndex = users.findIndex(u => u.id === userId);
         if (userIndex > -1) {
             users[userIndex].avatar = avatar;
             set(state => ({ user: state.user ? { ...state.user, avatar } : null }));
         }
      },
      updateWalletBalance: (userId, amount) => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const newBalance = users[userIndex].walletBalance + amount;
            users[userIndex].walletBalance = newBalance;
            set(state => ({
                user: state.user && state.user.id === userId
                    ? { ...state.user, walletBalance: newBalance }
                    : state.user
            }));
        }
      },
      updateTotalSpent: (userId, amount) => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex > -1) {
            const newTotal = users[userIndex].totalSpent + amount;
            users[userIndex].totalSpent = newTotal;
            set(state => ({
                user: state.user && state.user.id === userId
                    ? { ...state.user, totalSpent: newTotal }
                    : state.user
            }));
        }
      },
    }),
    {
      name: 'topup-hub-auth',
    }
  )
);
