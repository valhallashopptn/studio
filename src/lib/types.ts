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
    instructions: React.ReactNode;
}
