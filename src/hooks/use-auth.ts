
'use client';

import { create } from 'zustand';
import { useEffect } from 'react';
import type { User, AdminPermissions } from '@/lib/types';
import { useUserDatabase } from './use-user-database';
import { createClient } from '@/lib/supabaseClient';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  isInitialized: boolean;
  login: (credentials: Pick<User, 'email' | 'password'>) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  register: (userDetails: Omit<User, 'id' | 'isAdmin' | 'totalSpent' | 'valhallaCoins' | 'walletBalance' | 'premium'>) => Promise<{ success: boolean; message?: string }>;
  updateUser: (userId: string, updates: Partial<Pick<User, 'name' | 'email'>>) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  updateAvatar: (userId: string, avatarUrl: string) => Promise<void>;
  updateWalletBalance: (userId: string, amount: number) => void;
  updateTotalSpent: (userId: string, amount: number) => void;
  updateValhallaCoins: (userId: string, amount: number) => void;
  clearWarning: (userId: string) => void;
  initializeAuth: (session: Session | null) => Promise<void>;
};

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isPremium: false,
    isInitialized: false,
    login: async ({ email, password }) => {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true };
    },
    logout: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, isAdmin: false, isPremium: false });
    },
    register: async ({ name, email, password }) => {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    avatar_url: 'https://placehold.co/100x100.png',
                }
            }
        });

        if (error) {
            return { success: false, message: error.message };
        }
        
        if (!session?.user) {
            return { success: false, message: "Registration successful, but no session created. Please try logging in." };
        }

        // Add user to our public users table
        const { addUser } = useUserDatabase.getState();
        const newUser: User = {
            id: session.user.id,
            name,
            email,
            avatar: 'https://placehold.co/100x100.png',
            isAdmin: false,
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
        await addUser(newUser);

        return { success: true };
    },
    updateUser: async (userId, updates) => {
        const { updateUser } = useUserDatabase.getState();
        return updateUser(userId, updates);
    },
    changePassword: async (newPassword) => {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return !error;
    },
    updateAvatar: async (userId, avatarUrl) => {
        const { updateUser } = useUserDatabase.getState();
        await updateUser(userId, { avatar: avatarUrl });
    },
    updateWalletBalance: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
        if (userToUpdate) {
            updateUser(userId, { walletBalance: userToUpdate.walletBalance + amount });
        }
    },
    updateValhallaCoins: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
        if (userToUpdate) {
            updateUser(userId, { valhallaCoins: userToUpdate.valhallaCoins + amount });
        }
    },
    updateTotalSpent: (userId, amount) => {
        const { findUserById, updateUser } = useUserDatabase.getState();
        const userToUpdate = findUserById(userId);
        if (userToUpdate) {
            updateUser(userId, { totalSpent: userToUpdate.totalSpent + amount });
        }
    },
    clearWarning: (userId) => {
        const { updateUser } = useUserDatabase.getState();
        updateUser(userId, { warningMessage: null });
    },
    initializeAuth: async (session) => {
        if (session) {
            const { findUserById } = useUserDatabase.getState();
            let profile = findUserById(session.user.id);
            if (!profile) {
                // Wait a moment for db initialization
                await new Promise(res => setTimeout(res, 500));
                profile = findUserById(session.user.id);
            }

            if (profile) {
                 const isPremium = !!(profile.premium && new Date(profile.premium.expiresAt) > new Date());
                 set({ user: profile, isAuthenticated: true, isAdmin: !!profile.isAdmin, isPremium, isInitialized: true });
            } else {
                 set({ user: null, isAuthenticated: false, isAdmin: false, isPremium: false, isInitialized: true });
            }
        } else {
            set({ user: null, isAuthenticated: false, isAdmin: false, isPremium: false, isInitialized: true });
        }
    },
}));

export const useAuth = useAuthStore;

export function AuthInitializer() {
    useEffect(() => {
        const supabase = createClient();
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, session: Session | null) => {
                useAuth.getState().initializeAuth(session);
            }
        );

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            useAuth.getState().initializeAuth(session);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return null;
}
