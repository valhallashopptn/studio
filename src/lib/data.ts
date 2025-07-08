
import type { Product, PaymentMethod, Review, Category, StockItem } from '@/lib/types';
import { Landmark, Wallet } from 'lucide-react';

export let categories: Category[] = [
  { id: 'cat_1', name: 'Game', image: 'https://placehold.co/300x200.png', deliveryMethod: 'instant', customFields: [] },
  { 
    id: 'cat_2', 
    name: 'Digital', 
    image: 'https://placehold.co/300x200.png', 
    deliveryMethod: 'manual', 
    customFields: [
      { id: 'field_1', name: 'account_email', label: 'Account Email', type: 'email', placeholder: 'Enter the account email' }
    ] 
  },
];

export let products: Product[] = [
  {
    id: 'prod_001',
    name: 'Mobile Legends Diamonds',
    description: 'Instantly top up your Mobile Legends diamonds. Enter your User ID and Zone ID.',
    price: 5.00,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'mobile game',
    category: 'Game',
  },
  {
    id: 'prod_002',
    name: 'Steam Wallet Code',
    description: 'Add funds to your Steam account with this digital wallet code.',
    price: 10.00,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'pc gaming',
    category: 'Game',
  },
  {
    id: 'prod_003',
    name: 'Netflix Subscription',
    description: 'Get a one-month premium subscription to Netflix for unlimited streaming.',
    price: 15.00,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'streaming service',
    category: 'Digital',
  },
  {
    id: 'prod_004',
    name: 'Spotify Premium',
    description: 'Enjoy ad-free music and offline downloads with a 1-month Spotify Premium plan.',
    price: 9.99,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'music streaming',
    category: 'Digital',
  },
  {
    id: 'prod_005',
    name: 'Genshin Impact Crystals',
    description: 'Top up Genesis Crystals to get your favorite characters and weapons.',
    price: 20.00,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'mobile game',
    category: 'Game',
  },
  {
    id: 'prod_006',
    name: 'PlayStation Network Card',
    description: 'A digital code to add funds to your PlayStation account.',
    price: 25.00,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'console gaming',
    category: 'Game',
  },
  {
    id: 'prod_007',
    name: 'Amazon Gift Card',
    description: 'A $25 digital gift card for anything on Amazon.',
    price: 25.00,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'gift card',
    category: 'Digital',
  },
  {
    id: 'prod_008',
    name: 'Valorant Points',
    description: 'Purchase Valorant points for weapon skins and other in-game content.',
    price: 10.00,
    image: 'https://placehold.co/600x400.png',
    aiHint: 'pc gaming',
    category: 'Game',
  },
];

export let stock: StockItem[] = [
    { id: 'stk_001', productId: 'prod_002', code: 'STEAM-ABCD-1234', isUsed: false, addedAt: new Date().toISOString() },
    { id: 'stk_002', productId: 'prod_002', code: 'STEAM-EFGH-5678', isUsed: false, addedAt: new Date().toISOString() },
    { id: 'stk_003', productId: 'prod_002', code: 'STEAM-IJKL-9012', isUsed: true, addedAt: new Date().toISOString() },
    { id: 'stk_004', productId: 'prod_006', code: 'PSN-QWER-ASDF', isUsed: false, addedAt: new Date().toISOString() },
];


export let paymentMethods: PaymentMethod[] = [
    {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: Landmark,
    },
    {
        id: 'e_wallet',
        name: 'E-Wallet',
        icon: Wallet,
    }
];

export const reviews: Review[] = [
  {
    id: 'rev_001',
    name: 'GamerXPro',
    avatar: 'https://placehold.co/100x100.png',
    rating: 5,
    text: "TopUp Hub is my go-to for Mobile Legends diamonds. The process is incredibly fast and I get my diamonds instantly. Highly recommended!",
    product: 'Mobile Legends Diamonds',
  },
  {
    id: 'rev_002',
    name: 'StreamQueen',
    avatar: 'https://placehold.co/100x100.png',
    rating: 5,
    text: "I was hesitant at first, but buying my Netflix sub here was seamless. Cheaper and faster than other places. I'm a customer for life!",
    product: 'Netflix Subscription',
  },
  {
    id: 'rev_003',
    name: 'PC_Master_Race',
    avatar: 'https://placehold.co/100x100.png',
    rating: 4,
    text: "Got my Steam Wallet code within minutes. The site is easy to navigate. Would be 5 stars if they had more obscure indie game cards.",
    product: 'Steam Wallet Code',
  },
  {
    id: 'rev_004',
    name: 'K-PopLover',
    avatar: 'https://placehold.co/100x100.png',
    rating: 5,
    text: "Needed Spotify Premium ASAP and TopUp Hub delivered. The whole process took less than 2 minutes. Super impressive service!",
    product: 'Spotify Premium',
  },
  {
    id: 'rev_005',
    name: 'Valorant_Viper',
    avatar: 'https://placehold.co/100x100.png',
    rating: 5,
    text: "Fantastic service! Topped up my Valorant points without any issues. The payment was secure and the points appeared in my account right away.",
    product: 'Valorant Points',
  }
];


export const getProductCatalogForAI = () => products.map(p => `${p.name} - ${p.description}`).join('\n');
