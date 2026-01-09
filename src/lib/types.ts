export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  category: 'fitness' | 'beachwear';
  sizes: string[];
  colors: string[];
  description: string;
  features: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface SizeGuide {
  size: string;
  bust: string;
  waist: string;
  hip: string;
}
