-- Firebase Studio Database Schema
-- Version 1.0

-- Drop tables in reverse order of dependency to avoid foreign key constraint issues.
DROP TABLE IF EXISTS `order_item_custom_fields`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `stock`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `coupons`;
DROP TABLE IF EXISTS `payment_methods`;
DROP TABLE IF EXISTS `product_details`;
DROP TABLE IF EXISTS `product_variants`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `category_custom_fields`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `users`;

--
-- Table structure for table `users`
--
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint(1) DEFAULT 0,
  `avatar` varchar(255) DEFAULT NULL,
  `walletBalance` decimal(10,2) DEFAULT 0.00,
  `totalSpent` decimal(10,2) DEFAULT 0.00,
  `valhallaCoins` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--
INSERT INTO `users` (`id`, `name`, `email`, `password`, `isAdmin`, `avatar`, `walletBalance`, `totalSpent`, `valhallaCoins`) VALUES
('1', 'Admin User', 'admin@topuphub.com', 'admin', 1, 'https://placehold.co/100x100.png', 1000.00, 0.00, 0),
('user_1672532400000', 'SlayerGod', 'slayer@example.com', 'password123', 0, 'https://placehold.co/100x100.png', 10.00, 1250.00, 12500),
('user_1672532400001', 'Luna', 'luna@example.com', 'password123', 0, 'https://placehold.co/100x100.png', 200.00, 600.00, 6000),
('2', 'Test User', 'user@topuphub.com', 'user', 0, 'https://placehold.co/100x100.png', 50.00, 250.00, 2500),
('user_1672532400002', 'Rogue', 'rogue@example.com', 'password123', 0, 'https://placehold.co/100x100.png', 5.00, 150.00, 1500),
('3', 'Jane Smith', 'jane.smith@example.com', 'password123', 0, 'https://placehold.co/100x100.png', 25.50, 25.50, 255),
('user_1672532400003', 'Zephyr', 'zephyr@example.com', 'password123', 0, 'https://placehold.co/100x100.png', 75.00, 30.00, 300);

--
-- Table structure for table `categories`
--
CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `backImage` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `deliveryMethod` enum('manual','instant') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `categories`
--
INSERT INTO `categories` (`id`, `name`, `image`, `backImage`, `description`, `deliveryMethod`) VALUES
('cat_1', 'Game', 'https://placehold.co/300x200.png', 'https://placehold.co/300x200.png', 'Instant codes and top-ups for popular games on PC, console, and mobile.', 'instant'),
('cat_2', 'Digital', 'https://placehold.co/300x200.png', 'https://placehold.co/300x200.png', 'Gift cards and subscriptions for streaming, music, and online shopping.', 'manual');

--
-- Table structure for table `category_custom_fields`
--
CREATE TABLE `category_custom_fields` (
  `id` varchar(255) NOT NULL,
  `categoryId` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('text','email','number') NOT NULL,
  `placeholder` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `category_custom_fields_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `category_custom_fields`
--
INSERT INTO `category_custom_fields` (`id`, `categoryId`, `label`, `name`, `type`, `placeholder`) VALUES
('field_1', 'cat_2', 'Account Email', 'account_email', 'email', 'Enter the account email');

--
-- Table structure for table `products`
--
CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `categoryId` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `aiHint` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--
INSERT INTO `products` (`id`, `name`, `description`, `categoryId`, `image`, `aiHint`) VALUES
('prod_001', 'Mobile Legends Diamonds', 'Instantly top up your Mobile Legends diamonds. Enter your User ID and Zone ID.', 'cat_1', 'https://placehold.co/600x400.png', 'mobile game'),
('prod_002', 'Steam Wallet Code', 'Add funds to your Steam account with this digital wallet code.', 'cat_1', 'https://placehold.co/600x400.png', 'pc gaming'),
('prod_003', 'Netflix Subscription', 'Get a premium subscription to Netflix for unlimited streaming.', 'cat_2', 'https://placehold.co/600x400.png', 'streaming service'),
('prod_004', 'Spotify Premium', 'Enjoy ad-free music and offline downloads with a Spotify Premium plan.', 'cat_2', 'https://placehold.co/600x400.png', 'music streaming'),
('prod_005', 'Genshin Impact Crystals', 'Top up Genesis Crystals to get your favorite characters and weapons.', 'cat_1', 'https://placehold.co/600x400.png', 'mobile game'),
('prod_006', 'PlayStation Network Card', 'A digital code to add funds to your PlayStation account.', 'cat_1', 'https://placehold.co/600x400.png', 'console gaming'),
('prod_007', 'Amazon Gift Card', 'A digital gift card for anything on Amazon.', 'cat_2', 'https://placehold.co/600x400.png', 'gift card'),
('prod_008', 'Valorant Points', 'Purchase Valorant points for weapon skins and other in-game content.', 'cat_1', 'https://placehold.co/600x400.png', 'pc gaming');

--
-- Table structure for table `product_variants`
--
CREATE TABLE `product_variants` (
  `id` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `product_variants`
--
INSERT INTO `product_variants` (`id`, `productId`, `name`, `price`) VALUES
('ml_100', 'prod_001', '100 Diamonds', 5.00), ('ml_500', 'prod_001', '500 Diamonds', 24.00), ('ml_1000', 'prod_001', '1000 Diamonds', 45.00),
('steam_10', 'prod_002', '$10 Code', 10.00), ('steam_20', 'prod_002', '$20 Code', 20.00), ('steam_50', 'prod_002', '$50 Code', 50.00),
('netflix_1m', 'prod_003', '1 Month Premium', 15.00), ('netflix_3m', 'prod_003', '3 Months Premium', 44.00),
('spotify_1m', 'prod_004', '1 Month', 9.99), ('spotify_3m', 'prod_004', '3 Months', 29.97), ('spotify_1y', 'prod_004', '1 Year', 99.99),
('genshin_300', 'prod_005', '300 Crystals', 4.99), ('genshin_980', 'prod_005', '980 Crystals', 14.99), ('genshin_1980', 'prod_005', '1980 Crystals', 29.99),
('psn_10', 'prod_006', '$10 Card', 10.00), ('psn_25', 'prod_006', '$25 Card', 25.00), ('psn_50', 'prod_006', '$50 Card', 50.00),
('amazon_10', 'prod_007', '$10 Card', 10.00), ('amazon_25', 'prod_007', '$25 Card', 25.00), ('amazon_50', 'prod_007', '$50 Card', 50.00),
('vp_500', 'prod_008', '500 Points', 5.00), ('vp_1150', 'prod_008', '1150 Points', 10.00), ('vp_2400', 'prod_008', '2400 Points', 20.00);

--
-- Table structure for table `product_details`
--
CREATE TABLE `product_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `productId` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `product_details_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `product_details`
--
INSERT INTO `product_details` (`productId`, `title`, `content`) VALUES
('prod_001', 'How It Works', 'You will be asked to provide your Mobile Legends User ID and Zone ID during checkout. The diamonds will be credited directly to your account.'),
('prod_001', 'Delivery Time', 'Typically delivered within 5-15 minutes after payment confirmation.'),
('prod_001', 'Important Notes', 'Please double-check your User ID and Zone ID. We are not responsible for top-ups to incorrect accounts.'),
('prod_002', 'Redemption Instructions', '1. Log in to your Steam account.\n2. Go to \"Redeem a Steam Wallet Code\".\n3. Enter the code provided after purchase.\n4. The funds will be added to your account instantly.'),
('prod_002', 'Region', 'This is a global code and can be redeemed on any Steam account.'),
('prod_002', 'Terms & Conditions', 'Steam Wallet funds are non-refundable and cannot be withdrawn.'),
('prod_003', 'Activation Process', 'During checkout, provide the email address of the Netflix account you wish to upgrade. We will process the subscription for that account.'),
('prod_003', 'What You Get', 'Netflix Premium plan, including 4K streaming and up to 4 simultaneous screens.'),
('prod_003', 'Please Note', 'This is a manual service. Activation may take up to 24 hours after payment is confirmed.');

--
-- Table structure for table `reviews`
--
CREATE TABLE `reviews` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `text` text NOT NULL,
  `productName` varchar(255) NOT NULL,
  `proofImage` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `reviews`
--
INSERT INTO `reviews` (`id`, `name`, `avatar`, `rating`, `text`, `productName`, `proofImage`) VALUES
('rev_001', 'GamerXPro', 'https://placehold.co/100x100.png', 5, 'TopUp Hub is my go-to for Mobile Legends diamonds. The process is incredibly fast and I get my diamonds instantly. Highly recommended!', 'Mobile Legends Diamonds', NULL),
('rev_002', 'StreamQueen', 'https://placehold.co/100x100.png', 5, 'I was hesitant at first, but buying my Netflix sub here was seamless. Cheaper and faster than other places. I\'m a customer for life!', 'Netflix Subscription', NULL),
('rev_003', 'PC_Master_Race', 'https://placehold.co/100x100.png', 4, 'Got my Steam Wallet code within minutes. The site is easy to navigate. Would be 5 stars if they had more obscure indie game cards.', 'Steam Wallet Code', NULL),
('rev_004', 'K-PopLover', 'https://placehold.co/100x100.png', 5, 'Needed Spotify Premium ASAP and TopUp Hub delivered. The whole process took less than 2 minutes. Super impressive service!', 'Spotify Premium', NULL),
('rev_005', 'Valorant_Viper', 'https://placehold.co/100x100.png', 5, 'Fantastic service! Topped up my Valorant points without any issues. The payment was secure and the points appeared in my account right away.', 'Valorant Points', NULL);

--
-- Table structure for table `stock`
--
CREATE TABLE `stock` (
  `id` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `isUsed` tinyint(1) DEFAULT 0,
  `addedAt` datetime NOT NULL,
  `usedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `stock`
--
INSERT INTO `stock` (`id`, `productId`, `code`, `isUsed`, `addedAt`, `usedAt`) VALUES
('stk_001', 'prod_002', 'STEAM-ABCD-1234', 0, NOW(), NULL),
('stk_002', 'prod_002', 'STEAM-EFGH-5678', 0, NOW(), NULL),
('stk_003', 'prod_002', 'STEAM-IJKL-9012', 1, NOW(), NOW()),
('stk_004', 'prod_006', 'PSN-QWER-ASDF', 0, NOW(), NULL);

--
-- Table structure for table `payment_methods`
--
CREATE TABLE `payment_methods` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `instructions` text NOT NULL,
  `requiresProof` tinyint(1) NOT NULL,
  `taxRate` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `payment_methods`
--
INSERT INTO `payment_methods` (`id`, `name`, `icon`, `instructions`, `requiresProof`, `taxRate`) VALUES
('bank_transfer', 'Bank Transfer', 'Landmark', 'Please transfer the total amount to:\nBank: First National Bank\nAccount Name: TopUp Hub Inc.\nAccount Number: 123-456-7890\n\nPlease include your Order ID in the transaction description.', 1, 0.00),
('e_wallet', 'E-Wallet', 'Wallet', 'Please send the total amount to:\nService: PayNow\nRecipient Name: TopUp Hub\nPhone Number: +1 987 654 3210\n\nPlease include your Order ID in the payment reference.', 0, 2.00);

--
-- Table structure for table `coupons`
--
CREATE TABLE `coupons` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `discountType` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `usageLimit` int(11) NOT NULL,
  `timesUsed` int(11) NOT NULL DEFAULT 0,
  `firstPurchaseOnly` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `coupons`
--
INSERT INTO `coupons` (`id`, `code`, `discountType`, `value`, `expiresAt`, `usageLimit`, `timesUsed`, `firstPurchaseOnly`) VALUES
('coupon_1', 'WINTER10', 'percentage', 10.00, '2025-01-01 00:00:00', 100, 5, 0),
('coupon_2', '5OFF', 'fixed', 5.00, NULL, 50, 10, 0),
('coupon_3', 'WELCOME15', 'percentage', 15.00, NULL, 500, 0, 1);

--
-- Table structure for table `orders`
--
CREATE TABLE `orders` (
  `id` varchar(255) NOT NULL,
  `customerId` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentMethodId` varchar(255) NOT NULL,
  `paymentProofImage` text DEFAULT NULL,
  `status` enum('pending','completed','refunded') NOT NULL,
  `createdAt` datetime NOT NULL,
  `refundReason` text DEFAULT NULL,
  `refundedAt` datetime DEFAULT NULL,
  `appliedCouponCode` varchar(255) DEFAULT NULL,
  `discountAmount` decimal(10,2) DEFAULT NULL,
  `valhallaCoinsApplied` int(11) DEFAULT NULL,
  `valhallaCoinsValue` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customerId` (`customerId`),
  KEY `paymentMethodId` (`paymentMethodId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `order_items`
--
CREATE TABLE `order_items` (
  `id` varchar(255) NOT NULL,
  `orderId` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `variantId` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL,
  `pricePerUnit` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  KEY `variantId` (`variantId`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `order_item_custom_fields`
--
CREATE TABLE `order_item_custom_fields` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orderItemId` varchar(255) NOT NULL,
  `fieldName` varchar(255) NOT NULL,
  `fieldValue` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderItemId` (`orderItemId`),
  CONSTRAINT `order_item_custom_fields_ibfk_1` FOREIGN KEY (`orderItemId`) REFERENCES `order_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
