import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/google_maps';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const GOOGLE_MAPS_API_KEY = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');
    if (!GOOGLE_MAPS_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY is not configured');

    const { address } = await req.json();
    if (typeof address !== 'string' || address.trim().length < 3 || address.length > 300) {
      return new Response(
        JSON.stringify({ error: 'Bitte gültige Adresse angeben (mind. 3 Zeichen).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const url = `${GATEWAY_URL}/maps/api/geocode/json?address=${encodeURIComponent(address)}&language=de&region=de`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': GOOGLE_MAPS_API_KEY,
      },
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Geocoding failed [${res.status}]: ${JSON.stringify(data)}`);
    }
    if (data.status !== 'OK' || !data.results?.length) {
      return new Response(
        JSON.stringify({ error: `Adresse nicht gefunden (${data.status}).` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const r = data.results[0];
    return new Response(
      JSON.stringify({
        formatted_address: r.formatted_address,
        latitude: r.geometry.location.lat,
        longitude: r.geometry.location.lng,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('geocode-address error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
