export type FragranceGender = 'men' | 'women' | 'unisex' | 'oud';

export type FragranceFamily = 
  | 'Oriental Woody' 
  | 'Smoky Oud' 
  | 'Amber Gourmand' 
  | 'Spicy Leather' 
  | 'Floral Citrus' 
  | 'Aromatic Fougere' 
  | 'Warm Resin';

export type FragranceConcentration = 'Extrait de Parfum' | 'Eau de Parfum' | 'Parfum Oil (Attar)' | 'Elixir';

export interface FragranceNotes {
  top: string[];
  heart: string[];
  base: string[];
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  subtitle: string;
  description: string;
  story: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: 'men' | 'women' | 'unisex' | 'oud' | 'exclusive' | 'gift-set';
  gender: 'men' | 'women' | 'unisex';
  size: string; // e.g. "100ml / 3.4 fl.oz"
  availableSizes: { size: string; price: number; compareAtPrice?: number }[];
  concentration: FragranceConcentration;
  fragranceFamily: FragranceFamily;
  notes: FragranceNotes;
  longevity: '8-10 Hours' | '12+ Hours' | '14-18 Hours (Beast Mode)' | '6-8 Hours';
  sillage: 'Moderate' | 'Heavy' | 'Intense / Enormous' | 'Intimate';
  season: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  badge?: 'BEST SELLER' | 'NEW' | 'LIMITED' | 'SALE';
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNew?: boolean;
  isSale?: boolean;
  reviews?: ProductReview[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  price: number;
  quantity: number;
}

export interface FilterState {
  category: string;
  gender: string[];
  fragranceFamily: string[];
  concentration: string[];
  brand: string[];
  priceRange: [number, number];
  minRating: number;
  inStockOnly: boolean;
  searchQuery: string;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  city: string;
  area: string;
  streetAddress: string;
  building: string;
  apartment: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'Credit / Debit Card' | 'Instapay';
  shippingAddress: UserAddress;
  trackingNumber?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  tier: 'Oud Privé Member' | 'Silver Connoisseur' | 'Gold Master';
  points: number;
  role?: 'customer' | 'admin';
  addresses: UserAddress[];
  orders: Order[];
}
