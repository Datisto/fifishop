import { supabase } from './supabase';
import JSZip from 'jszip';

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

export interface ImageMetadata {
  url: string;
  filename: string;
  table: string;
  field: string;
  recordId: string;
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

async function downloadImage(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.blob();
  } catch (error) {
    console.error('Error downloading image:', url, error);
    return null;
  }
}

function extractFilenameFromUrl(url: string): string {
  const parts = url.split('/');
  return parts[parts.length - 1] || `image_${Date.now()}.jpg`;
}

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

async function collectImageUrls(backup: DatabaseBackup): Promise<ImageMetadata[]> {
  const images: ImageMetadata[] = [];

  backup.tables.products.forEach((product) => {
    if (product.main_image_url) {
      images.push({
        url: product.main_image_url,
        filename: extractFilenameFromUrl(product.main_image_url),
        table: 'products',
        field: 'main_image_url',
        recordId: product.id,
      });
    }
  });

  backup.tables.product_images.forEach((image) => {
    if (image.image_url) {
      images.push({
        url: image.image_url,
        filename: extractFilenameFromUrl(image.image_url),
        table: 'product_images',
        field: 'image_url',
        recordId: image.id,
      });
    }
  });

  backup.tables.banners.forEach((banner) => {
    if (banner.image_url) {
      images.push({
        url: banner.image_url,
        filename: extractFilenameFromUrl(banner.image_url),
        table: 'banners',
        field: 'image_url',
        recordId: banner.id,
      });
    }
    if (banner.mobile_image_url) {
      images.push({
        url: banner.mobile_image_url,
        filename: extractFilenameFromUrl(banner.mobile_image_url),
        table: 'banners',
        field: 'mobile_image_url',
        recordId: banner.id,
      });
    }
  });

  backup.tables.categories.forEach((category) => {
    if (category.image_url) {
      images.push({
        url: category.image_url,
        filename: extractFilenameFromUrl(category.image_url),
        table: 'categories',
        field: 'image_url',
        recordId: category.id,
      });
    }
  });

  return images;
}

export async function exportDatabaseWithImages(
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  onProgress?.(0, 100, 'Експорт даних бази...');
  const backup = await exportDatabase();

  onProgress?.(20, 100, 'Збір інформації про зображення...');
  const imageMetadata = await collectImageUrls(backup);

  const zip = new JSZip();

  zip.file('database.json', JSON.stringify(backup, null, 2));
  zip.file('images-metadata.json', JSON.stringify(imageMetadata, null, 2));

  const imagesFolder = zip.folder('images');
  if (!imagesFolder) throw new Error('Failed to create images folder');

  onProgress?.(30, 100, `Завантаження ${imageMetadata.length} зображень...`);

  for (let i = 0; i < imageMetadata.length; i++) {
    const img = imageMetadata[i];
    const progress = 30 + Math.floor((i / imageMetadata.length) * 60);
    onProgress?.(progress, 100, `Завантаження зображення ${i + 1}/${imageMetadata.length}`);

    const blob = await downloadImage(img.url);
    if (blob) {
      imagesFolder.file(img.filename, blob);
    }
  }

  onProgress?.(90, 100, 'Створення ZIP архіву...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });

  onProgress?.(100, 100, 'Завершено!');
  return zipBlob;
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

export function downloadZipBackup(zipBlob: Blob): void {
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `database-backup-${new Date().toISOString().split('T')[0]}.zip`;
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

export function uploadZipBackup(): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.zip,application/zip';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      resolve(file);
    };

    input.click();
  });
}

export async function importDatabaseWithImages(
  zipFile: File,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<void> {
  onProgress?.(0, 100, 'Розпакування архіву...');

  const zip = await JSZip.loadAsync(zipFile);

  onProgress?.(10, 100, 'Читання даних бази...');
  const dbFile = zip.file('database.json');
  if (!dbFile) throw new Error('database.json not found in archive');

  const dbContent = await dbFile.async('text');
  const backup: DatabaseBackup = JSON.parse(dbContent);

  onProgress?.(20, 100, 'Читання метаданих зображень...');
  const metadataFile = zip.file('images-metadata.json');
  if (!metadataFile) throw new Error('images-metadata.json not found in archive');

  const metadataContent = await metadataFile.async('text');
  const imageMetadata: ImageMetadata[] = JSON.parse(metadataContent);

  onProgress?.(30, 100, 'Завантаження зображень на сервер...');
  const imageUrlMap = new Map<string, string>();

  const imagesFolder = zip.folder('images');
  if (!imagesFolder) throw new Error('images folder not found in archive');

  const imageFiles = Object.keys(zip.files).filter(name => name.startsWith('images/'));

  for (let i = 0; i < imageMetadata.length; i++) {
    const img = imageMetadata[i];
    const progress = 30 + Math.floor((i / imageMetadata.length) * 50);
    onProgress?.(progress, 100, `Завантаження ${i + 1}/${imageMetadata.length} зображень`);

    const zipFilePath = `images/${img.filename}`;
    const imageFile = zip.file(zipFilePath);

    if (imageFile) {
      try {
        const blob = await imageFile.async('blob');
        const file = new File([blob], img.filename, { type: blob.type || 'image/jpeg' });

        const fileExt = img.filename.split('.').pop();
        const newFileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(newFileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(newFileName);

        imageUrlMap.set(img.url, data.publicUrl);
      } catch (error) {
        console.error('Error processing image:', img.filename, error);
      }
    }
  }

  onProgress?.(80, 100, 'Оновлення URL зображень...');

  backup.tables.products.forEach(product => {
    if (product.main_image_url && imageUrlMap.has(product.main_image_url)) {
      product.main_image_url = imageUrlMap.get(product.main_image_url);
    }
  });

  backup.tables.product_images.forEach(image => {
    if (image.image_url && imageUrlMap.has(image.image_url)) {
      image.image_url = imageUrlMap.get(image.image_url);
    }
  });

  backup.tables.banners.forEach(banner => {
    if (banner.image_url && imageUrlMap.has(banner.image_url)) {
      banner.image_url = imageUrlMap.get(banner.image_url);
    }
    if (banner.mobile_image_url && imageUrlMap.has(banner.mobile_image_url)) {
      banner.mobile_image_url = imageUrlMap.get(banner.mobile_image_url);
    }
  });

  backup.tables.categories.forEach(category => {
    if (category.image_url && imageUrlMap.has(category.image_url)) {
      category.image_url = imageUrlMap.get(category.image_url);
    }
  });

  onProgress?.(90, 100, 'Імпорт даних в базу...');
  await importDatabase(backup);

  onProgress?.(100, 100, 'Завершено!');
}
