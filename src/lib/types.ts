

export interface ProductVariant {
  id: string;
  name: string; // e.g., "1 Month", "100 Diamonds"
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  variants: ProductVariant[];
  image: string;
  category: string;
  aiHint: string;
  details: { title: string; content: string }[];
}

export interface CartItem {
  id: string; // Composite ID: `${product.id}-${variant.id}`
  productId: string;
  name: string; // Product name
  image: string;
  category: string;
  quantity: number;
  variant: ProductVariant;
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
  backImage: string;
  description: string;
  deliveryMethod: 'manual' | 'instant';
  customFields: CustomField[];
}

export interface StockItem {
  id: string;
  productId: string;
  data: string; // Can be a simple code or a JSON string for complex data
  isUsed: boolean;
  addedAt: string;
  usedAt?: string;
}

export interface PaymentMethod {
    id:string;
    name: string;
    icon: string;
    instructions: string;
    requiresProof: boolean;
    taxRate?: number;
}

export interface AdminPermissions {
  canManageProducts?: boolean;
  canManageCategories?: boolean;
  canManageOrders?: boolean;
  canManageUsers?: boolean;
  canManageCoupons?: boolean;
  canManageAppearance?: boolean;
  canManageAdmins?: boolean;
  canManageLiveChat?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  isAdmin?: boolean;
  avatar?: string;
  walletBalance: number;
  totalSpent: number;
  valhallaCoins: number;
  nameStyle?: string;
  premium?: {
    subscribedAt: string; // ISO date string
    expiresAt: string; // ISO date string
  } | null;
  isBanned?: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  warningMessage?: string | null;
  permissions?: AdminPermissions;
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

export type OrderStatus = 'pending' | 'completed' | 'refunded';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // The percentage (e.g., 10 for 10%) or fixed amount
  expiresAt?: string; // ISO date string
  usageLimit: number; // Max number of times the coupon can be used
  timesUsed: number;
  firstPurchaseOnly?: boolean;
}

export interface Order {
  id: string;
  customer: User;
  items: CartItem[];
  total: number;
  paymentMethod: PaymentMethod;
  paymentProofImage?: string | null;
  status: OrderStatus;
  createdAt: string;
  deliveredItems?: { [cartItemId: string]: string[] }; // Array of data strings (can be codes or JSON)
  refundReason?: string;
  refundedAt?: string;
  appliedCouponCode?: string;
  discountAmount?: number;
  valhallaCoinsApplied?: number;
  valhallaCoinsValue?: number;
  reviewPrompted?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: any; // Firestore Timestamp
  userName: string;
  userAvatar?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessageText: string;
  lastMessageAt: any; // Firestore Timestamp
  status: 'open' | 'closed' | 'new';
  hasUnreadAdminMessages: boolean;
  hasUnreadUserMessages: boolean;
}
