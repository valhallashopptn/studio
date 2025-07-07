export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Game' | 'Digital';
  aiHint: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface PaymentMethod {
    id: string;
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
}
