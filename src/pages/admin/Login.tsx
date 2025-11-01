import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { loginAsync, isLoggingIn, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/admin/dashboard');
    }
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    try {
      // Execute reCAPTCHA if available
      if (executeRecaptcha) {
        try {
          const token = await executeRecaptcha('admin_login');

          // Verify token
          const verifyResponse = await supabase.functions.invoke('verify-recaptcha', {
            body: { token }
          });

          if (verifyResponse.error) {
            throw new Error(verifyResponse.error.message);
          }

          const { success, score } = verifyResponse.data;

          if (!success || score < 0.3) {
            setServerError('Bot detection failed. Please try again.');
            return;
          }
        } catch (recaptchaError) {
          console.error('reCAPTCHA verification error:', recaptchaError);
          setServerError('Bot verification failed. Please try again.');
          return;
        }
      } else {
        console.warn('reCAPTCHA not available, proceeding without verification');
      }

      // Proceed with login
      await loginAsync({ email, password });
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      if (msg.toLowerCase().includes('server error') || msg.toLowerCase().includes('unexpected')) {
        setServerError(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoggingIn}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </Button>
            {serverError && (
              <div className="pt-2">
                <Alert variant="destructive">
                  <AlertTitle>Login error</AlertTitle>
                  <AlertDescription>
                    {serverError}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
