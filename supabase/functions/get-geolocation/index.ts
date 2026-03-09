const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const fallbackGeo = {
  country: 'Unknown',
  countryCode: 'XX',
  region: 'Unknown',
  city: 'Unknown',
  lat: 0,
  lon: 0,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,countryCode,region,regionName,city,lat,lon`);

    if (!geoResponse.ok) {
      return new Response(JSON.stringify(fallbackGeo), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geoData = await geoResponse.json();

    if (geoData.status === 'fail') {
      return new Response(JSON.stringify(fallbackGeo), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        country: geoData.country || 'Unknown',
        countryCode: geoData.countryCode || 'XX',
        region: geoData.regionName || 'Unknown',
        city: geoData.city || 'Unknown',
        lat: geoData.lat || 0,
        lon: geoData.lon || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ ...fallbackGeo, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
