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
  orderBy,
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  full_description: string;
  specifications: Record<string, any>;
  price: number;
  discount_price?: number;
  stock_quantity: number;
  is_published: boolean;
  main_image_url?: string;
  brand: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
}

export interface ProductCategory {
  product_id: string;
  category_id: string;
}

export async function getProducts(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
  published?: boolean
) {
  const productsRef = collection(db, 'products');
  let q = query(productsRef, orderBy('created_at', 'desc'));

  if (published !== undefined) {
    q = query(q, where('is_published', '==', published));
  }

  const snapshot = await getDocs(q);
  let allProducts = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Product[];

  if (search) {
    const searchLower = search.toLowerCase();
    allProducts = allProducts.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.sku.toLowerCase().includes(searchLower)
    );
  }

  const totalCount = allProducts.length;
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedProducts = allProducts.slice(from, to);

  const productsWithImages = await Promise.all(
    paginatedProducts.map(async (product) => {
      const imagesRef = collection(db, 'product_images');
      const imagesQuery = query(imagesRef, where('product_id', '==', product.id), orderBy('sort_order'));
      const imagesSnapshot = await getDocs(imagesQuery);
      const product_images = imagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        ...product,
        product_images
      };
    })
  );

  return {
    products: productsWithImages,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}

export async function getProductById(id: string) {
  const productRef = doc(db, 'products', id);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    return null;
  }

  const product = {
    id: productSnap.id,
    ...productSnap.data()
  } as Product;

  const imagesRef = collection(db, 'product_images');
  const imagesQuery = query(imagesRef, where('product_id', '==', id), orderBy('sort_order'));
  const imagesSnapshot = await getDocs(imagesQuery);
  const product_images = imagesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const categoriesRef = collection(db, 'product_categories');
  const categoriesQuery = query(categoriesRef, where('product_id', '==', id));
  const categoriesSnapshot = await getDocs(categoriesQuery);
  const product_categories = categoriesSnapshot.docs.map(doc => ({
    category_id: doc.data().category_id
  }));

  return {
    ...product,
    product_images,
    product_categories
  };
}

export async function createProduct(product: Partial<Product>) {
  const slug = generateSlug(product.name || '');

  const newProduct = {
    ...product,
    slug,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'products'), newProduct);

  return {
    id: docRef.id,
    ...newProduct
  };
}

export async function updateProduct(id: string, product: Partial<Product>) {
  const productRef = doc(db, 'products', id);

  const updateData = {
    ...product,
    updated_at: new Date().toISOString()
  };

  await updateDoc(productRef, updateData);

  return {
    id,
    ...updateData
  };
}

export async function deleteProduct(id: string) {
  const product = await getProductById(id);

  if (product?.product_images) {
    for (const image of product.product_images) {
      await deleteProductImage(image.id);
    }
  }

  const categoriesRef = collection(db, 'product_categories');
  const categoriesQuery = query(categoriesRef, where('product_id', '==', id));
  const categoriesSnapshot = await getDocs(categoriesQuery);

  for (const categoryDoc of categoriesSnapshot.docs) {
    await deleteDoc(categoryDoc.ref);
  }

  const productRef = doc(db, 'products', id);
  await deleteDoc(productRef);
}

export async function toggleProductPublished(id: string, isPublished: boolean) {
  const productRef = doc(db, 'products', id);

  await updateDoc(productRef, {
    is_published: isPublished,
    updated_at: new Date().toISOString()
  });

  const productSnap = await getDoc(productRef);
  return {
    id: productSnap.id,
    ...productSnap.data()
  };
}

export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, `product-images/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

export async function addProductImage(
  productId: string,
  imageUrl: string,
  altText: string = '',
  sortOrder: number = 0
) {
  const newImage = {
    product_id: productId,
    image_url: imageUrl,
    alt_text: altText,
    sort_order: sortOrder,
    created_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'product_images'), newImage);

  return {
    id: docRef.id,
    ...newImage
  };
}

export async function deleteProductImage(imageId: string) {
  const imageRef = doc(db, 'product_images', imageId);
  const imageSnap = await getDoc(imageRef);

  if (imageSnap.exists()) {
    const imageData = imageSnap.data();
    const imageUrl = imageData.image_url;

    if (imageUrl && imageUrl.includes('firebase')) {
      try {
        const imagePath = decodeURIComponent(imageUrl.split('/o/')[1].split('?')[0]);
        const imageStorageRef = ref(storage, imagePath);
        await deleteObject(imageStorageRef);
      } catch (error) {
        console.error('Error deleting image from storage:', error);
      }
    }
  }

  await deleteDoc(imageRef);
}

export async function setProductCategories(productId: string, categoryIds: string[]) {
  const categoriesRef = collection(db, 'product_categories');
  const categoriesQuery = query(categoriesRef, where('product_id', '==', productId));
  const categoriesSnapshot = await getDocs(categoriesQuery);

  for (const categoryDoc of categoriesSnapshot.docs) {
    await deleteDoc(categoryDoc.ref);
  }

  if (categoryIds.length > 0) {
    for (const categoryId of categoryIds) {
      await addDoc(categoriesRef, {
        product_id: productId,
        category_id: categoryId
      });
    }
  }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
