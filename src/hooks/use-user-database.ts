
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { users as initialUsers } from '@/lib/data';

type UserDatabaseState = {
  users: User[];
  findUserByEmail: (email: string) => User | undefined;
  findUser: (email: string, password?: string) => User | undefined;
  findUserById: (id: string) => User | undefined;
  updateUser: (userId: string, updates: Partial<User>) => boolean;
  addUser: (newUser: User) => void;
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
      }
    }),
    {
      name: 'topup-hub-user-database',
      // This merge strategy prevents initial data from overwriting persisted user changes on re-hydration
      merge: (persistedState, currentState) => {
        if (!persistedState) {
          return currentState;
        }
        return {
          ...currentState,
          users: (persistedState as UserDatabaseState).users,
        };
      },
    }
  )
);
