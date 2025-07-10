
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AdminPermissions } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';

type UserDatabaseState = {
  users: User[];
  findUserByEmail: (email: string) => User | undefined;
  findUser: (email: string, password?: string) => User | undefined;
  findUserById: (id: string) => User | undefined;
  updateUser: (userId: string, updates: Partial<User>) => boolean;
  addUser: (newUser: User) => void;
  banUser: (userId: string) => void;
  unbanUser: (userId: string) => void;
  sendWarning: (userId: string, message: string) => void;
  promoteToAdmin: (userId: string, permissions: AdminPermissions) => void;
  demoteAdmin: (userId: string) => void;
  updateAdminPermissions: (userId: string, permissions: AdminPermissions) => void;
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
        return userUpdated;
      },
      addUser: (newUser) => {
        set(state => ({ users: [...state.users, newUser] }));
      },
      banUser: (userId) => get().updateUser(userId, { isBanned: true }),
      unbanUser: (userId) => get().updateUser(userId, { isBanned: false }),
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
    }),
    {
      name: 'topup-hub-user-database',
      merge: (persistedState, currentState) => {
        const persisted = persistedState as UserDatabaseState;
        const usersWithDefaults = (persisted.users || currentState.users).map(user => ({
            ...user,
            isBanned: user.isBanned ?? false,
            warningMessage: user.warningMessage ?? null,
            permissions: user.permissions ?? (user.isAdmin ? { canManageAdmins: true, canManageAppearance: true, canManageCategories: true, canManageCoupons: true, canManageOrders: true, canManageProducts: true, canManageUsers: true } : {}),
        }));
        return { ...currentState, users: usersWithDefaults };
      },
    }
  )
);
