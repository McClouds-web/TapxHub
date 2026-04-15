import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'client' | 'retainer';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    company_id?: string;
}

interface AuthContextType {
    user: User | null;
    signIn: (email: string, password: string) => Promise<boolean>;
    signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
    verifyEmail: (email: string, token: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin emails — add more here as needed
const ADMIN_EMAILS = ['tapiwa.makore@tapxmedia.com'];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
        const userEmail = supabaseUser.email?.toLowerCase().trim() || '';
        const isOwner = ADMIN_EMAILS.includes(userEmail);
        const defaultName = supabaseUser.user_metadata?.full_name || userEmail.split('@')[0] || 'User';
        const defaultRole: UserRole = isOwner ? 'admin' : 'client';

        try {
            // Add a timeout to prevent absolute hangs on network/RLS issues
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000));
            
            const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();

            const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

            if (error || !profile) {
                console.warn('Profile not found or error, creating default...');
                // Attempt to auto-create, but don't await indefinitely
                supabase.from('profiles').upsert({
                    id: supabaseUser.id,
                    email: supabaseUser.email || userEmail,
                    full_name: defaultName,
                    role: defaultRole,
                }, { onConflict: 'id' }).then(({ error: e }) => {
                    if (e) console.error('Auto-creation failed:', e);
                });

                return {
                    id: supabaseUser.id,
                    name: defaultName,
                    email: supabaseUser.email || userEmail,
                    role: defaultRole,
                };
            }

            return {
                id: supabaseUser.id,
                name: profile.full_name || defaultName,
                email: supabaseUser.email || userEmail,
                role: isOwner ? 'admin' : (profile.role as UserRole),
                company_id: profile.company_id,
            };
        } catch (e) {
            console.error('fetchProfile error:', e);
            // Never return null — always return a usable user object
            return {
                id: supabaseUser.id,
                name: defaultName,
                email: supabaseUser.email || userEmail,
                role: defaultRole,
            };
        }
    };

    useEffect(() => {
        // Force initial session check to unblock loading spinner
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    const profile = await fetchProfile(session.user);
                    setUser(profile);
                } else {
                    setUser(null);
                }
            } catch (e) {
                console.error("Auth init error:", e);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        initSession();

        // Use onAuthStateChange as the secondary listener for subsequent events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_evt, session) => {
            if (session?.user) {
                const profile = await fetchProfile(session.user);
                setUser(profile);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string): Promise<boolean> => {
        const { error } = await supabase.auth.signUp({ 
            email,
            password,
            options: {
                data: { full_name: fullName, role: 'client' }
            }
        });

        if (error) {
            toast.error(error.message);
            return false;
        }

        toast.success('Registration successful! Please check your email for the 6-digit code.');
        return true;
    };

    const verifyEmail = async (email: string, token: string): Promise<boolean> => {
        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup'
        });

        if (error) {
            toast.error(error.message);
            return false;
        }

        toast.success('Email successfully verified! You are now logged in.');
        return true;
    };

    const signIn = async (email: string, password: string): Promise<boolean> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            toast.error(error.message);
            return false;
        }

        toast.success('Successfully logged in. Welcome to Hub OS.');
        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        toast.info('Logged out');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, signIn, signUp, verifyEmail, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
