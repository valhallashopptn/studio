
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AdminPermissions } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';
import { useAuth } from './use-auth';

type UserDatabaseState = {
  users: User[];
  findUserByEmail: (email: string) => User | undefined;
  findUser: (email: string, password?: string) => User | undefined;
  findUserById: (id: string) => User | undefined;
  updateUser: (userId: string, updates: Partial<User>) => boolean;
  addUser: (newUser: User) => void;
  banUser: (userId: string, reason: string) => void;
  unbanUser: (userId: string) => void;
  sendWarning: (userId: string, message: string) => void;
  promoteToAdmin: (userId: string, permissions: AdminPermissions) => void;
  demoteAdmin: (userId: string) => void;
  updateAdminPermissions: (userId: string, permissions: AdminPermissions) => void;
  subscribeToPremium: (userId: string, months?: number) => void;
  cancelSubscription: (userId: string) => void;
  updateNameStyle: (userId: string, style: string) => void;
};

export const useUserDatabase = create(
  persist<UserDatabaseState>(
    (set, get) => ({
      users: initialUsers,
      findUserByEmail: (email) => {
        return get().users.find(u => u.email === email);
      },
      findUser: (email, password) => {
        const users = get().users;
        if (password) {
          return users.find(u => u.email === email && u.password === password);
        }
        return users.find(u => u.email === email);
      },
      findUserById: (id) => {
        return get().users.find(u => u.id === id);
      },
      updateUser: (userId, updates) => {
        let userUpdated = false;
        set(state => {
          const newUsers = state.users.map(u => {
            if (u.id === userId) {
              userUpdated = true;
              return { ...u, ...updates };
            }
            return u;
          });
          return { users: newUsers };
        });
        // Also update the currently logged-in user if they are the one being changed
        const { user: authUser, setUserState } = useAuth.getState() as any; // Use any to access internal setter
        if (authUser && authUser.id === userId && setUserState) {
          setUserState({ ...authUser, ...updates });
        }
        return userUpdated;
      },
      addUser: (newUser) => {
        set(state => ({ users: [...state.users, newUser] }));
      },
      banUser: (userId, reason) => {
        get().updateUser(userId, { 
            isBanned: true,
            bannedAt: new Date().toISOString(),
            banReason: reason,
        });
      },
      unbanUser: (userId) => {
        get().updateUser(userId, { 
            isBanned: false,
            bannedAt: null,
            banReason: null,
        });
      },
      sendWarning: (userId, message) => get().updateUser(userId, { warningMessage: message }),
      promoteToAdmin: (userId, permissions) => {
        get().updateUser(userId, { isAdmin: true, permissions });
      },
      demoteAdmin: (userId) => {
        get().updateUser(userId, { isAdmin: false, permissions: {} });
      },
      updateAdminPermissions: (userId, permissions) => {
        get().updateUser(userId, { permissions });
      },
      subscribeToPremium: (userId, months = 1) => {
        const currentUser = get().findUserById(userId);
        if (!currentUser) return;

        const wasSubscribedBefore = currentUser.premium?.subscribedAt;
        
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

        const updates: Partial<User> = { premium: premiumData };

        // Add 500 bonus coins if it's their very first time subscribing
        if (!wasSubscribedBefore) {
          updates.valhallaCoins = (currentUser.valhallaCoins || 0) + 500;
        }

        get().updateUser(userId, updates);
      },
      cancelSubscription: (userId) => {
        const currentUser = get().findUserById(userId);
        if (!currentUser || !currentUser.premium) return;

        const updatedPremiumData = { ...currentUser.premium, status: 'cancelled' as const };
        get().updateUser(userId, { premium: updatedPremiumData });
      },
      updateNameStyle: (userId, style) => {
         const { updateUser } = get();
         updateUser(userId, { nameStyle: style });
      },
    }),
    {
      name: 'topup-hub-user-database',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as UserDatabaseState;
        const usersWithDefaults = (persisted.users || currentState.users).map(user => ({
            ...user,
            isBanned: user.isBanned ?? false,
            bannedAt: user.bannedAt ?? null,
            banReason: user.banReason ?? null,
            warningMessage: user.warningMessage ?? null,
            permissions: user.permissions ?? (user.isAdmin ? { canManageAdmins: true, canManageAppearance: true, canManageCategories: true, canManageCoupons: true, canManageOrders: true, canManageProducts: true, canManageUsers: true } : {}),
        }));
        return { ...currentState, users: usersWithDefaults };
      },
    }
  )
);
