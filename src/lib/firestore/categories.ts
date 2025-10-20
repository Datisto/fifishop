import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  is_published?: boolean;
  show_in_header: boolean;
  icon_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

export async function getCategories(activeOnly: boolean = false) {
  const categoriesRef = collection(db, 'categories');
  let q = query(categoriesRef, orderBy('sort_order'));

  if (activeOnly) {
    q = query(categoriesRef, where('is_active', '==', true), orderBy('sort_order'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Category[];
}

export async function getCategoryById(id: string) {
  const categoryRef = doc(db, 'categories', id);
  const categorySnap = await getDoc(categoryRef);

  if (!categorySnap.exists()) {
    return null;
  }

  return {
    id: categorySnap.id,
    ...categorySnap.data()
  } as Category;
}

export async function createCategory(category: Partial<Category>) {
  const slug = generateSlug(category.name || '');

  const newCategory = {
    ...category,
    slug,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'categories'), newCategory);

  return {
    id: docRef.id,
    ...newCategory
  };
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const categoryRef = doc(db, 'categories', id);

  const updateData = {
    ...category,
    updated_at: new Date().toISOString()
  };

  await updateDoc(categoryRef, updateData);

  return {
    id,
    ...updateData
  };
}

export async function deleteCategory(id: string) {
  const productCategoriesRef = collection(db, 'product_categories');
  const productCategoriesQuery = query(productCategoriesRef, where('category_id', '==', id));
  const productCategoriesSnapshot = await getDocs(productCategoriesQuery);

  for (const productCategoryDoc of productCategoriesSnapshot.docs) {
    await deleteDoc(productCategoryDoc.ref);
  }

  const categoryRef = doc(db, 'categories', id);
  await deleteDoc(categoryRef);
}

export async function updateCategorySortOrder(categories: { id: string; sort_order: number }[]) {
  for (const category of categories) {
    const categoryRef = doc(db, 'categories', category.id);
    await updateDoc(categoryRef, {
      sort_order: category.sort_order,
      updated_at: new Date().toISOString()
    });
  }
}

export async function getHeaderCategories() {
  const categoriesRef = collection(db, 'categories');
  const q = query(
    categoriesRef,
    where('show_in_header', '==', true),
    where('is_active', '==', true),
    orderBy('sort_order')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Category[];
}

export async function toggleCategoryPublished(id: string, isPublished: boolean) {
  const categoryRef = doc(db, 'categories', id);

  await updateDoc(categoryRef, {
    is_published: isPublished,
    updated_at: new Date().toISOString()
  });

  const categorySnap = await getDoc(categoryRef);
  return {
    id: categorySnap.id,
    ...categorySnap.data()
  };
}

export async function uploadCategoryIcon(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, `category-icons/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

export async function updateCategoriesOrder(categories: Array<{ id: string; sort_order: number; parent_id?: string | null }>) {
  for (const cat of categories) {
    const categoryRef = doc(db, 'categories', cat.id);
    await updateDoc(categoryRef, {
      sort_order: cat.sort_order,
      parent_id: cat.parent_id || null,
      updated_at: new Date().toISOString()
    });
  }
}

export function buildCategoryTree(categories: Category[]): CategoryTreeNode[] {
  const categoryMap = new Map<string, CategoryTreeNode>();
  const rootCategories: CategoryTreeNode[] = [];

  categories.forEach((cat) => {
    categoryMap.set(cat.id, { ...cat, children: [] });
  });

  categories.forEach((cat) => {
    const node = categoryMap.get(cat.id)!;
    if (cat.parent_id) {
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(node);
      } else {
        rootCategories.push(node);
      }
    } else {
      rootCategories.push(node);
    }
  });

  return rootCategories;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
