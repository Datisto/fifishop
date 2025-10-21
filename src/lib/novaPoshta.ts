export interface NovaPoshtaCity {
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

export interface NovaPoshtaWarehouse {
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
  PostFinance: string;
  BicycleParking: string;
  PaymentAccess: string;
  POSTerminal: string;
  InternationalShipping: string;
  TotalMaxWeightAllowed: string;
  PlaceMaxWeightAllowed: string;
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

export interface NovaPoshtaApiResponse<T> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
  info: {
    totalCount: number;
  };
  messageCodes: string[];
  errorCodes: string[];
  warningCodes: string[];
  infoCodes: string[];
}

const NOVA_POSHTA_API_URL = 'https://api.novaposhta.ua/v2.0/json/';

export async function searchCities(searchQuery: string, limit: number = 20): Promise<NovaPoshtaCity[]> {
  const apiKey = import.meta.env.VITE_NOVA_POSHTA_API_KEY;

  if (!apiKey) {
    console.warn('Nova Poshta API key is not configured');
    return [];
  }

  try {
    const response = await fetch(NOVA_POSHTA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
        modelName: 'Address',
        calledMethod: 'searchSettlements',
        methodProperties: {
          CityName: searchQuery,
          Limit: limit,
        },
      }),
    });

    const result: NovaPoshtaApiResponse<{ Present: string; Warehouses: string; MainDescription: string; Area: string; Region: string; SettlementTypeCode: string; Ref: string; DeliveryCity: string }> = await response.json();

    if (!result.success || !result.data || result.data.length === 0) {
      return [];
    }

    const cities: NovaPoshtaCity[] = result.data[0].Addresses?.map((address: any) => ({
      Ref: address.DeliveryCity || address.Ref,
      Description: address.MainDescription || address.Present,
      DescriptionRu: address.MainDescription || address.Present,
      Area: address.Area || '',
      AreaDescription: address.AreaDescription || '',
      AreaDescriptionRu: address.AreaDescription || '',
      Region: address.Region || '',
      RegionDescription: address.RegionDescription || '',
      RegionDescriptionRu: address.RegionDescription || '',
    })) || [];

    return cities;
  } catch (error) {
    console.error('Error searching cities from Nova Poshta API:', error);
    return [];
  }
}

export async function getWarehouses(cityRef: string, limit: number = 500): Promise<NovaPoshtaWarehouse[]> {
  const apiKey = import.meta.env.VITE_NOVA_POSHTA_API_KEY;

  if (!apiKey) {
    console.warn('Nova Poshta API key is not configured');
    return [];
  }

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
        methodProperties: {
          CityRef: cityRef,
          Limit: limit,
        },
      }),
    });

    const result: NovaPoshtaApiResponse<NovaPoshtaWarehouse> = await response.json();

    if (!result.success || !result.data) {
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching warehouses from Nova Poshta API:', error);
    return [];
  }
}

export async function getAllCities(): Promise<NovaPoshtaCity[]> {
  const apiKey = import.meta.env.VITE_NOVA_POSHTA_API_KEY;

  if (!apiKey) {
    console.warn('Nova Poshta API key is not configured');
    return [];
  }

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
      return [];
    }

    return result.data;
  } catch (error) {
    console.error('Error fetching all cities from Nova Poshta API:', error);
    return [];
  }
}

export function formatWarehouseDisplay(warehouse: NovaPoshtaWarehouse): string {
  return `№${warehouse.Number}: ${warehouse.ShortAddress}`;
}

export function formatCityDisplay(city: NovaPoshtaCity): string {
  if (city.AreaDescription && city.AreaDescription !== city.Description) {
    return `${city.Description}, ${city.AreaDescription}`;
  }
  return city.Description;
}
