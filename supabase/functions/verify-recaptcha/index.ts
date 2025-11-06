import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting monitoring
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    // Validate origin to prevent abuse
    const origin = req.headers.get('origin');
    const referer = req.headers.get('referer');
    const allowedOrigins = [
      'https://ypbuuvipagxfjfrhizcs.supabase.co',
      'http://localhost:5173',
      'http://localhost:3000'
    ];

    // Check if request is from allowed origin
    const isAllowedOrigin = origin && allowedOrigins.some(allowed => origin.includes(allowed));
    const isAllowedReferer = referer && allowedOrigins.some(allowed => referer.includes(allowed));

    if (!isAllowedOrigin && !isAllowedReferer) {
      console.warn('reCAPTCHA verification from unauthorized origin:', {
        origin: origin || 'none',
        referer: referer || 'none',
        ip: clientIp
      });
    }

    const { token } = await req.json();
    
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'Token is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Verifying reCAPTCHA token from IP:', clientIp);
    
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
      }
    );

    const data = await response.json();
    
    // Log verification results with security monitoring
    if (!data.success) {
      console.warn('reCAPTCHA verification failed:', {
        'error-codes': data['error-codes'],
        ip: clientIp
      });
    }

    if (data.success && data.score < 0.5) {
      console.warn('Low reCAPTCHA score detected:', {
        score: data.score,
        ip: clientIp,
        action: data.action
      });
    } else if (data.success) {
      console.log('reCAPTCHA verification successful:', {
        score: data.score,
        action: data.action
      });
    }
    
    return new Response(
      JSON.stringify({ 
        success: data.success,
        score: data.score || 0,
        action: data.action 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in verify-recaptcha function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
