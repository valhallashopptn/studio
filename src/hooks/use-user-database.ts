
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AdminPermissions } from '@/lib/types';
import { useAuth } from './use-auth';
import { createClient } from '@/lib/supabaseClient';

type UserDatabaseState = {
  users: User[];
  isInitialized: boolean;
  fetchInitialUsers: () => Promise<void>;
  findUserByEmail: (email: string) => User | undefined;
  findUserById: (id: string) => User | undefined;
  updateUser: (userId: string, updates: Partial<User>) => Promise<boolean>;
  addUser: (newUser: User) => Promise<void>;
  banUser: (userId: string, reason: string) => void;
  unbanUser: (userId: string) => void;
  sendWarning: (userId: string, message: string) => void;
  promoteToAdmin: (userId: string, permissions: AdminPermissions) => void;
  demoteAdmin: (userId: string) => void;
  updateAdminPermissions: (userId: string, permissions: AdminPermissions) => void;
  subscribeToPremium: (userId: string, months?: number) => void;
  updateNameStyle: (userId: string, styleId: string) => void;
};

export const useUserDatabase = create<UserDatabaseState>(
    (set, get) => ({
      users: [],
      isInitialized: false,
      fetchInitialUsers: async () => {
          if (get().isInitialized) return;
          const supabase = createClient();
          const { data, error } = await supabase.from('users').select('*');
          if (error) {
              console.error("Error fetching initial users:", error);
          } else {
              set({ users: data as User[], isInitialized: true });
          }
      },
      findUserByEmail: (email) => {
        return get().users.find(u => u.email === email);
      },
      findUserById: (id) => {
        return get().users.find(u => u.id === id);
      },
      updateUser: async (userId, updates) => {
        const supabase = createClient();
        const { error } = await supabase.from('users').update(updates).eq('id', userId);
        if (error) {
            console.error("Error updating user:", error);
            return false;
        }
        
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
        const { user: authUser, initializeAuth } = useAuth.getState();
        if (authUser && authUser.id === userId && initializeAuth) {
           const supabase = createClient();
           const { data: { session } } = await supabase.auth.getSession();
           await initializeAuth(session);
        }
        return userUpdated;
      },
      addUser: async (newUser) => {
          const supabase = createClient();
          const { error } = await supabase.from('users').insert(newUser);
          if (error) {
              console.error("Error adding user:", error);
              return;
          }
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
          subscribedAt: currentUser.premium?.subscribedAt || new Date().toISOString(),
          expiresAt: expiresAt.toISOString(),
        };

        const updates: Partial<User> = { premium: premiumData };

        if (!wasSubscribedBefore) {
          const { updateValhallaCoins } = useAuth.getState();
          updateValhallaCoins(userId, 500);
        }

        get().updateUser(userId, updates);
      },
      updateNameStyle: (userId, styleId) => {
        get().updateUser(userId, { nameStyle: styleId });
      },
    })
);

// Initializer component to fetch users
export function UserDatabaseInitializer() {
    useEffect(() => {
        useUserDatabase.getState().fetchInitialUsers();
    }, []);
    return null;
}
