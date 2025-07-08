
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
  customFieldValues?: Record<string, string>;
}

export interface CustomField {
  id: string;
  label: string;
  name: string;
  type: 'text' | 'email' | 'number';
  placeholder?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  deliveryMethod: 'manual' | 'instant';
  customFields: CustomField[];
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
    icon: string;
    instructions: string;
    requiresProof: boolean;
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
