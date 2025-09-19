import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AdminContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkAdminStatus: (userId?: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const checkAdminStatus = async (userId?: string): Promise<boolean> => {
    const id = userId ?? user?.id;
    if (!id) return false;
    
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', id)
        .eq('is_active', true)
        .single();

      if (error || !data) return false;
      return true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        
        // Check if user is admin
        const adminStatus = await checkAdminStatus(data.user.id);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          await signOut();
          throw new Error('Access denied. Admin privileges required.');
        }
      }

      return { error: null };
    } catch (error) {
      console.error('Admin sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      cleanupAuthState();
      await supabase.auth.signOut({ scope: 'global' });
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const adminStatus = await checkAdminStatus(session.user.id);
            setIsAdmin(adminStatus);
            setLoading(false); // Only set loading false after admin check
          }, 0);
        } else {
          setIsAdmin(false);
          setLoading(false); // Set loading false when no user
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const adminStatus = await checkAdminStatus(session.user.id);
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    isAdmin,
    loading,
    signIn,
    signOut,
    checkAdminStatus,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};