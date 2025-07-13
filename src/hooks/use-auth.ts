
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
  register: (userDetails: Omit<User, 'id' | 'isAdmin' | 'totalSpent' | 'valhallaCoins' | 'walletBalance' | 'premium' | 'isBanned' | 'bannedAt' | 'banReason' | 'warningMessage' | 'nameStyle'>) => Promise<{ success: boolean; message?: string }>;
  updateUser: (updates: Partial<Pick<User, 'name' | 'email'>>) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<{ error: any | null }>;
  updateAvatar: (avatarUrl: string) => Promise<void>;
  updateWalletBalance: (amount: number) => void;
  updateTotalSpent: (amount: number) => void;
  updateValhallaCoins: (amount: number) => void;
  clearWarning: () => void;
  initializeAuth: (session: Session | null) => Promise<void>;
};

const useAuthStore = create<AuthState>((set, get) => ({
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
        // The onAuthStateChange listener will handle setting state to null.
    },
    register: async ({ name, email, password }) => {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
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
    updateUser: async (updates) => {
        const { user } = get();
        if (!user) return false;
        const { updateUser } = useUserDatabase.getState();
        return updateUser(user.id, updates);
    },
    changePassword: async (newPassword) => {
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error };
    },
    updateAvatar: async (avatarUrl) => {
        const { user } = get();
        if (!user) return;
        const supabase = createClient();
        const { error } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
        if (error) console.error("Error updating avatar in auth:", error);
        
        const { updateUser } = useUserDatabase.getState();
        await updateUser(user.id, { avatar: avatarUrl });
    },
    updateWalletBalance: (amount) => {
        const { user } = get();
        if (user) {
            const { updateUser } = useUserDatabase.getState();
            updateUser(user.id, { walletBalance: user.walletBalance + amount });
        }
    },
    updateValhallaCoins: (amount) => {
        const { user } = get();
        if (user) {
            const { updateUser } = useUserDatabase.getState();
            updateUser(user.id, { valhallaCoins: user.valhallaCoins + amount });
        }
    },
    updateTotalSpent: (amount) => {
        const { user } = get();
        if (user) {
            const { updateUser } = useUserDatabase.getState();
            updateUser(user.id, { totalSpent: user.totalSpent + amount });
        }
    },
    clearWarning: () => {
        const { user } = get();
        if (user) {
            const { updateUser } = useUserDatabase.getState();
            updateUser(user.id, { warningMessage: null });
        }
    },
    initializeAuth: async (session) => {
        if (session) {
            const { findUserById, fetchInitialUsers, isInitialized } = useUserDatabase.getState();
            
            // Ensure the user database is loaded before trying to find a user
            if (!isInitialized) {
                await fetchInitialUsers();
            }

            let profile = findUserById(session.user.id);
            if (!profile) {
                // This can happen if the user record wasn't created yet or there's a sync issue.
                // Log an error and sign the user out to prevent an inconsistent state.
                console.error("Could not find user profile for session. Signing out.");
                const supabase = createClient();
                await supabase.auth.signOut();
                set({ user: null, isAuthenticated: false, isAdmin: false, isPremium: false, isInitialized: true });
                return;
            }

            const isPremium = !!(profile.premium && new Date(profile.premium.expiresAt) > new Date());
            set({ user: profile, isAuthenticated: true, isAdmin: !!profile.isAdmin, isPremium, isInitialized: true });

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
            async (_event: AuthChangeEvent, session: Session | null) => {
                await useAuth.getState().initializeAuth(session);
            }
        );

        // Initial check
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            await useAuth.getState().initializeAuth(session);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    return null;
}
