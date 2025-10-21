import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NovaPoshtaWarehouse {
  Ref: string;
  SiteKey: string;
  Description: string;
  DescriptionRu: string;
  ShortAddress: string;
  ShortAddressRu: string;
  Phone: string;
  TypeOfWarehouse: string;
  Number: string;
  CityRef: string;
  CityDescription: string;
  CityDescriptionRu: string;
  SettlementRef: string;
  SettlementDescription: string;
  SettlementAreaDescription: string;
  SettlementRegionsDescription: string;
  SettlementTypeDescription: string;
  Latitude?: string;
  Longitude?: string;
  Schedule: {
    Monday?: string;
    Tuesday?: string;
    Wednesday?: string;
    Thursday?: string;
    Friday?: string;
    Saturday?: string;
    Sunday?: string;
  };
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

async function getAllWarehouses(apiKey: string): Promise<NovaPoshtaWarehouse[]> {
  try {
    const response = await fetch(NOVA_POSHTA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {},
      }),
    });

    const result: NovaPoshtaApiResponse<NovaPoshtaWarehouse> = await response.json();

    if (!result.success || !result.data) {
      console.error('Nova Poshta API error:', result.errors);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching warehouses from Nova Poshta API:', error);
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

    console.log('Fetching warehouses from Nova Poshta API...');
    const warehouses = await getAllWarehouses(novaPoshtaApiKey);

    if (warehouses.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No warehouses fetched from Nova Poshta API'
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

    console.log(`Fetched ${warehouses.length} warehouses. Syncing to database...`);

    const warehousesToInsert = warehouses.map((warehouse) => ({
      ref: warehouse.Ref,
      site_key: warehouse.SiteKey || '',
      description: warehouse.Description,
      description_ru: warehouse.DescriptionRu || '',
      short_address: warehouse.ShortAddress,
      short_address_ru: warehouse.ShortAddressRu || '',
      phone: warehouse.Phone || '',
      type_of_warehouse: warehouse.TypeOfWarehouse || '',
      number: warehouse.Number,
      city_ref: warehouse.CityRef,
      city_description: warehouse.CityDescription,
      settlement_ref: warehouse.SettlementRef || '',
      latitude: warehouse.Latitude || null,
      longitude: warehouse.Longitude || null,
      schedule: warehouse.Schedule || {},
      updated_at: new Date().toISOString(),
    }));

    const batchSize = 500;
    let totalInserted = 0;

    for (let i = 0; i < warehousesToInsert.length; i += batchSize) {
      const batch = warehousesToInsert.slice(i, i + batchSize);

      const { error } = await supabase
        .from('nova_poshta_warehouses')
        .upsert(batch, { onConflict: 'ref' });

      if (error) {
        console.error(`Error syncing batch ${i / batchSize + 1}:`, error);
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

      totalInserted += batch.length;
      console.log(`Synced ${totalInserted} / ${warehousesToInsert.length} warehouses`);
    }

    console.log(`Successfully synced ${totalInserted} warehouses`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${totalInserted} warehouses`,
        count: totalInserted
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
    console.error('Error in sync-nova-poshta-warehouses:', error);

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
