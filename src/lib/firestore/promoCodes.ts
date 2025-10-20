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
  increment
} from 'firebase/firestore';
import { db } from '../firebase';

export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getPromoCodes() {
  const promoCodesRef = collection(db, 'promo_codes');
  const q = query(promoCodesRef, orderBy('created_at', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PromoCode[];
}

export async function getPromoCodeById(id: string) {
  const promoCodeRef = doc(db, 'promo_codes', id);
  const promoCodeSnap = await getDoc(promoCodeRef);

  if (!promoCodeSnap.exists()) {
    return null;
  }

  return {
    id: promoCodeSnap.id,
    ...promoCodeSnap.data()
  } as PromoCode;
}

export async function getPromoCodeByCode(code: string) {
  const promoCodesRef = collection(db, 'promo_codes');
  const q = query(promoCodesRef, where('code', '==', code.toUpperCase()));

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return {
    id: snapshot.docs[0].id,
    ...snapshot.docs[0].data()
  } as PromoCode;
}

export async function validatePromoCode(code: string, orderAmount: number) {
  const promoCode = await getPromoCodeByCode(code);

  if (!promoCode) {
    return { valid: false, error: 'Промокод не знайдено' };
  }

  if (!promoCode.is_active) {
    return { valid: false, error: 'Промокод неактивний' };
  }

  const now = new Date();
  const validFrom = new Date(promoCode.valid_from);
  const validUntil = new Date(promoCode.valid_until);

  if (now < validFrom) {
    return { valid: false, error: 'Промокод ще не активний' };
  }

  if (now > validUntil) {
    return { valid: false, error: 'Промокод прострочений' };
  }

  if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) {
    return { valid: false, error: 'Промокод вичерпано' };
  }

  if (promoCode.min_order_amount && orderAmount < promoCode.min_order_amount) {
    return {
      valid: false,
      error: `Мінімальна сума замовлення: ${promoCode.min_order_amount} грн`
    };
  }

  let discountAmount = 0;

  if (promoCode.discount_type === 'percentage') {
    discountAmount = (orderAmount * promoCode.discount_value) / 100;

    if (promoCode.max_discount_amount && discountAmount > promoCode.max_discount_amount) {
      discountAmount = promoCode.max_discount_amount;
    }
  } else {
    discountAmount = promoCode.discount_value;
  }

  return {
    valid: true,
    promoCode,
    discountAmount: Math.min(discountAmount, orderAmount)
  };
}

export async function createPromoCode(promoCode: Partial<PromoCode>) {
  const code = promoCode.code?.toUpperCase() || '';

  const existing = await getPromoCodeByCode(code);
  if (existing) {
    throw new Error('Промокод з таким кодом вже існує');
  }

  const newPromoCode = {
    ...promoCode,
    code,
    used_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const docRef = await addDoc(collection(db, 'promo_codes'), newPromoCode);

  return {
    id: docRef.id,
    ...newPromoCode
  };
}

export async function updatePromoCode(id: string, promoCode: Partial<PromoCode>) {
  const promoCodeRef = doc(db, 'promo_codes', id);

  if (promoCode.code) {
    const code = promoCode.code.toUpperCase();
    const existing = await getPromoCodeByCode(code);
    if (existing && existing.id !== id) {
      throw new Error('Промокод з таким кодом вже існує');
    }
    promoCode.code = code;
  }

  const updateData = {
    ...promoCode,
    updated_at: new Date().toISOString()
  };

  await updateDoc(promoCodeRef, updateData);

  return {
    id,
    ...updateData
  };
}

export async function deletePromoCode(id: string) {
  const promoCodeRef = doc(db, 'promo_codes', id);
  await deleteDoc(promoCodeRef);
}

export async function incrementPromoCodeUsage(code: string) {
  const promoCode = await getPromoCodeByCode(code);

  if (!promoCode) {
    throw new Error('Промокод не знайдено');
  }

  const promoCodeRef = doc(db, 'promo_codes', promoCode.id);
  await updateDoc(promoCodeRef, {
    used_count: increment(1),
    updated_at: new Date().toISOString()
  });
}

export async function togglePromoCodeActive(id: string, isActive: boolean) {
  const promoCodeRef = doc(db, 'promo_codes', id);

  await updateDoc(promoCodeRef, {
    is_active: isActive,
    updated_at: new Date().toISOString()
  });

  const promoCodeSnap = await getDoc(promoCodeRef);
  return {
    id: promoCodeSnap.id,
    ...promoCodeSnap.data()
  };
}

export async function getPromoCodeStats() {
  const promoCodesRef = collection(db, 'promo_codes');
  const snapshot = await getDocs(promoCodesRef);
  const promoCodes = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as PromoCode[];

  const stats = {
    total: promoCodes.length,
    active: promoCodes.filter(p => p.is_active).length,
    expired: promoCodes.filter(p => new Date(p.valid_until) < new Date()).length,
    used: promoCodes.filter(p => p.used_count > 0).length,
    totalUsageCount: promoCodes.reduce((sum, p) => sum + p.used_count, 0)
  };

  return stats;
}
