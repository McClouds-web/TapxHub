import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseAdmin } from '@/lib/supabase';
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
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 5000));
            
            const profilePromise = supabase
                .from('profiles')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();

            const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

            // If profile exists and company_id is present, return it
            if (!error && profile && profile.company_id) {
                return {
                    id: supabaseUser.id,
                    name: profile.full_name || defaultName,
                    email: supabaseUser.email || userEmail,
                    role: isOwner ? 'admin' : (profile.role as UserRole),
                    company_id: profile.company_id,
                };
            }

            // If we're here, we either have no profile, or no company_id (New Client)
            console.warn('Handling fresh onboarding for:', userEmail);

            let targetCompanyId = profile?.company_id;

            // 1. Create Company if needed (for clients)
            if (!targetCompanyId && !isOwner) {
                const workspaceName = `${defaultName}'s Workspace`;
                const clientToUse = supabaseAdmin || supabase;
                
                const { data: newCompany, error: compError } = await clientToUse
                    .from('companies')
                    .insert({
                        name: workspaceName,
                        contact_email: userEmail,
                        status: 'Active',
                        client_type: 'retainer',
                        onboarding_completed: false
                    })
                    .select()
                    .single();
                
                if (compError) {
                    console.error('Company creation failed:', compError);
                } else {
                    targetCompanyId = newCompany.id;
                    console.log('Created auto-workspace:', targetCompanyId);
                }
            }

            // 2. Upsert Profile with linked company_id
            const profileUpdates = {
                id: supabaseUser.id,
                email: userEmail,
                full_name: defaultName,
                role: defaultRole,
                company_id: targetCompanyId,
            };

            const clientToUse = supabaseAdmin || supabase;
            const { data: finalProfile, error: upsertError } = await clientToUse
                .from('profiles')
                .upsert(profileUpdates, { onConflict: 'id' })
                .select()
                .single();

            if (upsertError) {
                console.error('Profile sync failed:', upsertError);
            }

            return {
                id: supabaseUser.id,
                name: finalProfile?.full_name || defaultName,
                email: userEmail,
                role: isOwner ? 'admin' : (finalProfile?.role as UserRole || defaultRole),
                company_id: targetCompanyId,
            };
        } catch (e) {
            console.error('fetchProfile critical failure:', e);
            return {
                id: supabaseUser.id,
                name: defaultName,
                email: userEmail,
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
