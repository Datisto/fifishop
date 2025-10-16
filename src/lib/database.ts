import { supabase } from './supabase';

export interface DatabaseBackup {
  version: string;
  timestamp: string;
  tables: {
    categories: any[];
    products: any[];
    product_categories: any[];
    product_images: any[];
    banners: any[];
    promo_codes: any[];
    orders: any[];
    order_items: any[];
  };
}

const TABLES_TO_BACKUP = [
  'categories',
  'products',
  'product_categories',
  'product_images',
  'banners',
  'promo_codes',
  'orders',
  'order_items',
];

export async function exportDatabase(): Promise<DatabaseBackup> {
  const backup: DatabaseBackup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    tables: {
      categories: [],
      products: [],
      product_categories: [],
      product_images: [],
      banners: [],
      promo_codes: [],
      orders: [],
      order_items: [],
    },
  };

  for (const table of TABLES_TO_BACKUP) {
    const { data, error } = await supabase.from(table).select('*');

    if (error) {
      console.error(`Error exporting ${table}:`, error);
      throw new Error(`Failed to export ${table}: ${error.message}`);
    }

    backup.tables[table as keyof typeof backup.tables] = data || [];
  }

  return backup;
}

export async function importDatabase(backup: DatabaseBackup): Promise<void> {
  if (backup.version !== '1.0') {
    throw new Error('Unsupported backup version');
  }

  const orderedTables = [
    'categories',
    'products',
    'product_categories',
    'product_images',
    'banners',
    'promo_codes',
    'orders',
    'order_items',
  ];

  for (const table of orderedTables) {
    const data = backup.tables[table as keyof typeof backup.tables];

    if (!data || data.length === 0) {
      continue;
    }

    const { error: deleteError } = await supabase
      .from(table)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      console.error(`Error clearing ${table}:`, deleteError);
      throw new Error(`Failed to clear ${table}: ${deleteError.message}`);
    }

    const { error: insertError } = await supabase.from(table).insert(data);

    if (insertError) {
      console.error(`Error importing ${table}:`, insertError);
      throw new Error(`Failed to import ${table}: ${insertError.message}`);
    }
  }
}

export function downloadBackup(backup: DatabaseBackup): void {
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function uploadBackup(): Promise<DatabaseBackup> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target?.result as string);
          resolve(backup);
        } catch (error) {
          reject(new Error('Invalid backup file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}
