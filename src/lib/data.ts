
import type { Product, Review, Category, StockItem, User } from '@/lib/types';
import { USD_TO_VALHALLA_COIN_RATE } from './ranks';

export let categories: Category[] = [
  { 
    id: 'cat_1', 
    name: 'Game', 
    image: 'https://placehold.co/300x200.png', 
    backImage: 'https://placehold.co/300x200.png',
    description: 'Instant codes and top-ups for popular games on PC, console, and mobile.',
    deliveryMethod: 'instant', 
    customFields: [] 
  },
  { 
    id: 'cat_2', 
    name: 'Digital', 
    image: 'https://placehold.co/300x200.png', 
    backImage: 'https://placehold.co/300x200.png',
    description: 'Gift cards and subscriptions for streaming, music, and online shopping.',
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
    variants: [
        { id: 'ml_100', name: '100 Diamonds', price: 5.00 },
        { id: 'ml_500', name: '500 Diamonds', price: 24.00 },
        { id: 'ml_1000', name: '1000 Diamonds', price: 45.00 },
    ],
    image: 'https://placehold.co/600x400.png',
    aiHint: 'mobile game',
    category: 'Game',
    details: [
        { title: 'How It Works', content: 'You will be asked to provide your Mobile Legends User ID and Zone ID during checkout. The diamonds will be credited directly to your account.' },
        { title: 'Delivery Time', content: 'Typically delivered within 5-15 minutes after payment confirmation.' },
        { title: 'Important Notes', content: 'Please double-check your User ID and Zone ID. We are not responsible for top-ups to incorrect accounts.' }
    ]
  },
  {
    id: 'prod_002',
    name: 'Steam Wallet Code',
    description: 'Add funds to your Steam account with this digital wallet code.',
    variants: [
        { id: 'steam_10', name: '$10 Code', price: 10.00 },
        { id: 'steam_20', name: '$20 Code', price: 20.00 },
        { id: 'steam_50', name: '$50 Code', price: 50.00 },
    ],
    image: 'https://placehold.co/600x400.png',
    aiHint: 'pc gaming',
    category: 'Game',
    details: [
        { title: 'Redemption Instructions', content: '1. Log in to your Steam account.\n2. Go to "Redeem a Steam Wallet Code".\n3. Enter the code provided after purchase.\n4. The funds will be added to your account instantly.' },
        { title: 'Region', content: 'This is a global code and can be redeemed on any Steam account.' },
        { title: 'Terms & Conditions', content: 'Steam Wallet funds are non-refundable and cannot be withdrawn.' }
    ]
  },
  {
    id: 'prod_003',
    name: 'Netflix Subscription',
    description: 'Get a premium subscription to Netflix for unlimited streaming.',
    variants: [
        { id: 'netflix_1m', name: '1 Month Premium', price: 15.00 },
        { id: 'netflix_3m', name: '3 Months Premium', price: 44.00 },
    ],
    image: 'https://placehold.co/600x400.png',
    aiHint: 'streaming service',
    category: 'Digital',
    details: [
        { title: 'Activation Process', content: 'During checkout, provide the email address of the Netflix account you wish to upgrade. We will process the subscription for that account.' },
        { title: 'What You Get', content: 'Netflix Premium plan, including 4K streaming and up to 4 simultaneous screens.' },
        { title: 'Please Note', content: 'This is a manual service. Activation may take up to 24 hours after payment is confirmed.' }
    ]
  },
  {
    id: 'prod_004',
    name: 'Spotify Premium',
    description: 'Enjoy ad-free music and offline downloads with a Spotify Premium plan.',
    variants: [
        { id: 'spotify_1m', name: '1 Month', price: 9.99 },
        { id: 'spotify_3m', name: '3 Months', price: 29.97 },
        { id: 'spotify_1y', name: '1 Year', price: 99.99 },
    ],
    image: 'https://placehold.co/600x400.png',
    aiHint: 'music streaming',
    category: 'Digital',
    details: [
        { title: 'Activation Process', content: 'You will receive a unique link via email to activate your Premium subscription. This will be sent to the email address used for purchase.' },
        { title: 'Eligibility', content: 'This offer is valid for both new and existing Spotify users who are not currently on a Premium plan.' },
        { title: 'Delivery Time', content: 'Activation links are typically sent within 1-2 hours of purchase.' }
    ]
  },
  {
    id: 'prod_005',
    name: 'Genshin Impact Crystals',
    description: 'Top up Genesis Crystals to get your favorite characters and weapons.',
    variants: [
        { id: 'genshin_300', name: '300 Crystals', price: 4.99 },
        { id: 'genshin_980', name: '980 Crystals', price: 14.99 },
        { id: 'genshin_1980', name: '1980 Crystals', price: 29.99 },
    ],
    image: 'https://placehold.co/600x400.png',
    aiHint: 'mobile game',
    category: 'Game',
    details: [
        { title: 'Required Information', content: 'During checkout, you will need to provide your Genshin Impact UID and Server (e.g., America, Europe, Asia).' },
        { title: 'Delivery Method', content: 'Genesis Crystals are topped up directly to your game account by our team.' },
        { title: 'Security', content: 'We never ask for your password. Your UID and Server are sufficient for the top-up.' }
    ]
  },
  {
    id: 'prod_006',
    name: 'PlayStation Network Card',
    description: 'A digital code to add funds to your PlayStation account.',
    variants: [
        { id: 'psn_10', name: '$10 Card', price: 10.00 },
        { id: 'psn_25', name: '$25 Card', price: 25.00 },
        { id: 'psn_50', name: '$50 Card', price: 50.00 },
    ],
    image: 'https://placehold.co/600x400.png',
    aiHint: 'console gaming',
    category: 'Game',
    details: [
        { title: 'Redemption Instructions', content: '1. Go to the PlayStation Store on your console.\n2. Select "Redeem Codes" from the menu.\n3. Enter the 12-digit code and the funds will be added to your wallet.' },
        { title: 'Account Region', content: 'This code is valid for US region PlayStation accounts only.' },
        { title: 'Instant Delivery', content: 'Your code will be displayed on the order confirmation page and sent to your email instantly after purchase.' }
    ]
  },
  {
    id: 'prod_007',
    name: 'Amazon Gift Card',
    description: 'A digital gift card for anything on Amazon.',
    variants: [
        { id: 'amazon_10', name: '$10 Card', price: 10.00 },
        { id: 'amazon_25', name: '$25 Card', price: 25.00 },
        { id: 'amazon_50', name: '$50 Card', price: 50.00 },
    ],
    image: 'https://placehold.co/600x400.png',
    aiHint: 'gift card',
    category: 'Digital',
    details: [
        { title: 'How to Redeem', content: 'Go to your Amazon account, click "Gift Cards," and then "Redeem a Gift Card." Enter the code provided.' },
        { title: 'Where to Use', content: 'Valid for purchases on Amazon.com (US Store).' },
        { title: 'Delivery', content: 'The gift card code will be delivered to your purchase email address within one hour.' }
    ]
  },
  {
    id: 'prod_008',
    name: 'Valorant Points',
    description: 'Purchase Valorant points for weapon skins and other in-game content.',
    variants: [
        { id: 'vp_500', name: '500 Points', price: 5.00 },
        { id: 'vp_1150', name: '1150 Points', price: 10.00 },
        { id: 'vp_2400', name: '2400 Points', price: 20.00 },
    ],
    image: 'https://placehold.co/600x400.png',
    aiHint: 'pc gaming',
    category: 'Game',
    details: [
        { title: 'Delivery Process', content: 'This is an instant delivery product. You will receive a digital code after completing your purchase.' },
        { title: 'How to Use', content: '1. Open the Valorant game client.\n2. Go to the in-game store and click "Purchase VP".\n3. Select the "Prepaid Cards & Codes" option.\n4. Enter your code to redeem the points.' },
        { title: 'Account Region', content: 'Please ensure your Valorant account region matches the region specified for the card.' }
    ]
  },
];

export let stock: StockItem[] = [
    { id: 'stk_001', productId: 'prod_002', code: 'STEAM-ABCD-1234', isUsed: false, addedAt: new Date().toISOString() },
    { id: 'stk_002', productId: 'prod_002', code: 'STEAM-EFGH-5678', isUsed: false, addedAt: new Date().toISOString() },
    { id: 'stk_003', productId: 'prod_002', code: 'STEAM-IJKL-9012', isUsed: true, addedAt: new Date().toISOString() },
    { id: 'stk_004', productId: 'prod_006', code: 'PSN-QWER-ASDF', isUsed: false, addedAt: new Date().toISOString() },
];

export let users: User[] = [
    { id: '1', name: 'Admin User', email: 'admin@topuphub.com', password: 'admin', isAdmin: true, avatar: 'https://placehold.co/100x100.png', walletBalance: 1000, totalSpent: 0, valhallaCoins: 0 },
    { id: 'user_1672532400000', name: 'SlayerGod', email: 'slayer@example.com', password: 'password123', isAdmin: false, avatar: 'https://placehold.co/100x100.png', walletBalance: 10, totalSpent: 1250, valhallaCoins: 1250 * USD_TO_VALHALLA_COIN_RATE },
    { id: 'user_1672532400001', name: 'Luna', email: 'luna@example.com', password: 'password123', isAdmin: false, avatar: 'https://placehold.co/100x100.png', walletBalance: 200, totalSpent: 600, valhallaCoins: 600 * USD_TO_VALHALLA_COIN_RATE },
    { id: '2', name: 'Test User', email: 'user@topuphub.com', password: 'user', isAdmin: false, avatar: 'https://placehold.co/100x100.png', walletBalance: 50, totalSpent: 250, valhallaCoins: 250 * USD_TO_VALHALLA_COIN_RATE },
    { id: 'user_1672532400002', name: 'Rogue', email: 'rogue@example.com', password: 'password123', isAdmin: false, avatar: 'https://placehold.co/100x100.png', walletBalance: 5, totalSpent: 150, valhallaCoins: 150 * USD_TO_VALHALLA_COIN_RATE },
    { id: '3', name: 'Jane Smith', email: 'jane.smith@example.com', password: 'password123', isAdmin: false, avatar: 'https://placehold.co/100x100.png', walletBalance: 25.50, totalSpent: 25.50, valhallaCoins: 25.50 * USD_TO_VALHALLA_COIN_RATE },
    { id: 'user_1672532400003', name: 'Zephyr', email: 'zephyr@example.com', password: 'password123', isAdmin: false, avatar: 'https://placehold.co/100x100.png', walletBalance: 75, totalSpent: 30, valhallaCoins: 30 * USD_TO_VALHALLA_COIN_RATE },
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
