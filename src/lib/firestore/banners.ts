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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';

export interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getBanners(activeOnly: boolean = false) {
  const bannersRef = collection(db, 'banners');
  let q = query(bannersRef, orderBy('sort_order'));

  if (activeOnly) {
    q = query(bannersRef, where('is_active', '==', true), orderBy('sort_order'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Banner[];
}

export async function getBannerById(id: string) {
  const bannerRef = doc(db, 'banners', id);
  const bannerSnap = await getDoc(bannerRef);

  if (!bannerSnap.exists()) {
    return null;
  }

  return {
    id: bannerSnap.id,
    ...bannerSnap.data()
  } as Banner;
}

export async function createBanner(banner: Partial<Banner>) {
  const newBanner = {
    ...banner,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'banners'), newBanner);

  return {
    id: docRef.id,
    ...newBanner
  };
}

export async function updateBanner(id: string, banner: Partial<Banner>) {
  const bannerRef = doc(db, 'banners', id);

  const updateData = {
    ...banner,
    updated_at: new Date().toISOString()
  };

  await updateDoc(bannerRef, updateData);

  return {
    id,
    ...updateData
  };
}

export async function deleteBanner(id: string) {
  const banner = await getBannerById(id);

  if (banner?.image_url && banner.image_url.includes('firebase')) {
    try {
      const imagePath = decodeURIComponent(banner.image_url.split('/o/')[1].split('?')[0]);
      const imageStorageRef = ref(storage, imagePath);
      await deleteObject(imageStorageRef);
    } catch (error) {
      console.error('Error deleting banner image from storage:', error);
    }
  }

  const bannerRef = doc(db, 'banners', id);
  await deleteDoc(bannerRef);
}

export async function uploadBannerImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
  const storageRef = ref(storage, `banners/${fileName}`);

  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
}

export async function updateBannerSortOrder(banners: { id: string; sort_order: number }[]) {
  for (const banner of banners) {
    const bannerRef = doc(db, 'banners', banner.id);
    await updateDoc(bannerRef, {
      sort_order: banner.sort_order,
      updated_at: new Date().toISOString()
    });
  }
}

export async function toggleBannerActive(id: string, isActive: boolean) {
  const bannerRef = doc(db, 'banners', id);

  await updateDoc(bannerRef, {
    is_active: isActive,
    updated_at: new Date().toISOString()
  });

  const bannerSnap = await getDoc(bannerRef);
  return {
    id: bannerSnap.id,
    ...bannerSnap.data()
  };
}

export async function updateBannersOrder(banners: { id: string; sort_order: number }[]) {
  return updateBannerSortOrder(banners);
}
