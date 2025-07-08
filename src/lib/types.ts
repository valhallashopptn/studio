export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  aiHint: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  deliveryMethod: 'manual' | 'instant';
}

export interface StockItem {
  id: string;
  productId: string;
  code: string;
  isUsed: boolean;
  addedAt: string;
}

export interface PaymentMethod {
    id:string;
    name: string;
    icon: React.ComponentType<{ className?: string }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  text: string;
  product: string;
  proofImage?: string;
}
