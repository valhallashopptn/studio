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
  register: (userDetails: Omit<User, 'id' | 'isAdmin'>) => boolean;
};

// Mock users database
const users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@topuphub.com', password: 'admin', isAdmin: true },
    { id: '2', name: 'Test User', email: 'user@topuphub.com', password: 'user', isAdmin: false },
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
            isAdmin: false
        };
        users.push(newUser);
        set({ user: newUser, isAuthenticated: true, isAdmin: false });
        return true;
      },
    }),
    {
      name: 'topup-hub-auth',
    }
  )
);
