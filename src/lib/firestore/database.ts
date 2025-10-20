import { collection, getDocs, addDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

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

const COLLECTIONS_TO_BACKUP = [
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

  for (const collectionName of COLLECTIONS_TO_BACKUP) {
    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      backup.tables[collectionName as keyof typeof backup.tables] = data;
    } catch (error) {
      console.error(`Error exporting ${collectionName}:`, error);
      throw new Error(`Failed to export ${collectionName}`);
    }
  }

  return backup;
}

export async function importDatabase(backup: DatabaseBackup): Promise<void> {
  if (backup.version !== '1.0') {
    throw new Error('Unsupported backup version');
  }

  const orderedCollections = [
    'categories',
    'products',
    'product_categories',
    'product_images',
    'banners',
    'promo_codes',
    'orders',
    'order_items',
  ];

  for (const collectionName of orderedCollections) {
    const data = backup.tables[collectionName as keyof typeof backup.tables];

    if (!data || data.length === 0) {
      continue;
    }

    try {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);

      for (const doc of snapshot.docs) {
        await deleteDoc(doc.ref);
      }

      for (const item of data) {
        const { id, ...itemData } = item;
        await addDoc(collectionRef, itemData);
      }
    } catch (error) {
      console.error(`Error importing ${collectionName}:`, error);
      throw new Error(`Failed to import ${collectionName}`);
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
