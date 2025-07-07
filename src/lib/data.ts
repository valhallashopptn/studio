import type { Product, PaymentMethod } from '@/lib/types';
import { Landmark, Wallet } from 'lucide-react';

export const products: Product[] = [
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

export const paymentMethods: PaymentMethod[] = [
    {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: Landmark,
        instructions: (
            <div className="text-sm space-y-2">
                <p>Please transfer the total amount to the following bank account:</p>
                <p><strong>Bank:</strong> First National Bank</p>
                <p><strong>Account Name:</strong> TopUp Hub Inc.</p>
                <p><strong>Account Number:</strong> 123-456-7890</p>
                <p className="font-semibold">Please include your Order ID in the transaction description.</p>
            </div>
        )
    },
    {
        id: 'e_wallet',
        name: 'E-Wallet',
        icon: Wallet,
        instructions: (
            <div className="text-sm space-y-2">
                <p>Please send the total amount to the following e-wallet account:</p>
                <p><strong>Service:</strong> PayNow</p>
                <p><strong>Recipient Name:</strong> TopUp Hub</p>
                <p><strong>Phone Number:</strong> +1 987 654 3210</p>
                <p className="font-semibold">Please include your Order ID in the payment reference.</p>
            </div>
        )
    }
];

export const productCatalogForAI = products.map(p => `${p.name} - ${p.description}`).join('\n');
