import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NovaPoshtaCity {
  Ref: string;
  Description: string;
  DescriptionRu: string;
  Area: string;
  AreaDescription: string;
  AreaDescriptionRu: string;
  Region: string;
  RegionDescription: string;
  RegionDescriptionRu: string;
  Latitude?: string;
  Longitude?: string;
}

interface NovaPoshtaApiResponse<T> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  info: {
    totalCount: number;
  };
}

const NOVA_POSHTA_API_URL = 'https://api.novaposhta.ua/v2.0/json/';

async function getAllCities(apiKey: string): Promise<NovaPoshtaCity[]> {
  try {
    const response = await fetch(NOVA_POSHTA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {},
      }),
    });

    const result: NovaPoshtaApiResponse<NovaPoshtaCity> = await response.json();

    if (!result.success || !result.data) {
      console.error('Nova Poshta API error:', result.errors);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching cities from Nova Poshta API:', error);
    return [];
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const novaPoshtaApiKey = Deno.env.get('NOVA_POSHTA_API_KEY');

    if (!novaPoshtaApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Nova Poshta API key not configured'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Fetching cities from Nova Poshta API...');
    const cities = await getAllCities(novaPoshtaApiKey);

    if (cities.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No cities fetched from Nova Poshta API'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(`Fetched ${cities.length} cities. Syncing to database...`);

    const citiesToInsert = cities.map((city) => ({
      ref: city.Ref,
      description: city.Description,
      description_ru: city.DescriptionRu || '',
      area: city.Area || '',
      area_description: city.AreaDescription || '',
      region: city.Region || '',
      region_description: city.RegionDescription || '',
      latitude: city.Latitude || null,
      longitude: city.Longitude || null,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('nova_poshta_cities')
      .upsert(citiesToInsert, { onConflict: 'ref' });

    if (error) {
      console.error('Error syncing cities:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Database error: ${error.message}`
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(`Successfully synced ${cities.length} cities`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${cities.length} cities`,
        count: cities.length
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in sync-nova-poshta-cities:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
