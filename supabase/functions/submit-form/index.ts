import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// In-memory rate limit store (per Deno isolate lifecycle)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  contact: { maxRequests: 3, windowMs: 15 * 60 * 1000 }, // 3 per 15 min
  rescue: { maxRequests: 2, windowMs: 30 * 60 * 1000 },  // 2 per 30 min
};

function checkRateLimit(ip: string, formType: string): { allowed: boolean; retryAfterSec: number } {
  const config = RATE_LIMITS[formType] || { maxRequests: 5, windowMs: 15 * 60 * 1000 };
  const key = `${formType}:${ip}`;
  const now = Date.now();

  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfterSec };
  }

  entry.count++;
  return { allowed: true, retryAfterSec: 0 };
}

// Cleanup stale entries periodically
function cleanupStore() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Cleanup every request (cheap for small maps)
  cleanupStore();

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('cf-connecting-ip')
      || req.headers.get('x-real-ip')
      || 'unknown';

    const body = await req.json();
    const { form_type, data } = body;

    if (!form_type || !data) {
      return new Response(
        JSON.stringify({ error: 'Missing form_type or data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!['contact', 'rescue'].includes(form_type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid form_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limit check
    const { allowed, retryAfterSec } = checkRateLimit(clientIp, form_type);
    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retry_after_seconds: retryAfterSec,
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfterSec),
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (form_type === 'contact') {
      // Validate contact fields
      const { name, email, message } = data;
      if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 100) {
        return new Response(JSON.stringify({ error: 'Invalid name' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
        return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!message || typeof message !== 'string' || message.trim().length === 0 || message.trim().length > 2000) {
        return new Response(JSON.stringify({ error: 'Invalid message' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { error } = await supabase.from('contact_messages').insert({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
        ip_address: clientIp,
        user_agent: req.headers.get('user-agent') || null,
      });

      if (error) throw error;

    } else if (form_type === 'rescue') {
      // Validate rescue fields
      const { name, email, phone, company, urgency, problems, additional_notes } = data;
      if (!name || typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 100) {
        return new Response(JSON.stringify({ error: 'Invalid name' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const hasEmail = email && typeof email === 'string' && email.trim().length > 0;
      const hasPhone = phone && typeof phone === 'string' && phone.trim().length > 0;
      if (!hasEmail && !hasPhone) {
        return new Response(JSON.stringify({ error: 'At least one contact method required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (hasEmail && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255)) {
        return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (!Array.isArray(problems) || problems.length === 0) {
        return new Response(JSON.stringify({ error: 'At least one problem required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const validUrgencies = ['low', 'medium', 'high', 'critical'];
      if (!validUrgencies.includes(urgency)) {
        return new Response(JSON.stringify({ error: 'Invalid urgency level' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const { error } = await supabase.from('rescue_requests').insert({
        name: name.trim(),
        email: hasEmail ? email.trim() : null,
        phone: hasPhone ? phone.trim() : null,
        company: company?.trim() || null,
        urgency,
        problems: problems.map((p: any) => ({ title: String(p.title || '').trim(), description: String(p.description || '').trim() })),
        additional_notes: additional_notes?.trim() || null,
      });

      if (error) throw error;
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
