import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Sync session changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      queryClient.setQueryData(['session'], session);
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ['is-admin', session?.user?.id],
    enabled: !!session?.user?.id,
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: session.user.id,
        _role: 'admin'
      });
      
      if (error) {
        console.error('Role check error:', error);
        return false;
      }
      
      return data as boolean;
    },
  });

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        const status = (error as any)?.status;
        const msg = error.message || '';
        if (msg.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before logging in');
        }
        if (msg.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        if (status === 500 || msg.includes('Database error') || msg.includes('unexpected_failure')) {
          throw new Error('Unexpected server error. Please try again shortly.');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['is-admin'] });
      toast.success('Login successful');
      navigate('/admin/dashboard');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed');
    },
  });

  return {
    session,
    isAdmin: isAdmin || false,
    isLoading: sessionLoading || roleLoading,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    loginError: (loginMutation.error as Error) || null,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
  };
};
