import { useState, useEffect } from 'react';

const DEFAULT_PRODUCT_IMAGE = 'https://images.pexels.com/photos/842535/pexels-photo-842535.jpeg?auto=compress&cs=tinysrgb&w=800';

export function useImageFallback(imageUrl: string | null | undefined) {
  const [src, setSrc] = useState(imageUrl || DEFAULT_PRODUCT_IMAGE);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
      setSrc(DEFAULT_PRODUCT_IMAGE);
      setIsError(true);
      return;
    }

    setIsError(false);
    setSrc(imageUrl);

    const img = new Image();
    img.src = imageUrl;

    img.onerror = () => {
      console.warn(`Failed to load image: ${imageUrl}`);
      setSrc(DEFAULT_PRODUCT_IMAGE);
      setIsError(true);
    };
  }, [imageUrl]);

  return { src, isError };
}
