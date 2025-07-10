-- This script defines the complete database schema for the TopUp Hub application.
-- Import this file into phpMyAdmin on Hostinger to create all necessary tables.

CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(1024) NOT NULL,
  `backImage` varchar(1024) NOT NULL,
  `description` text NOT NULL,
  `deliveryMethod` enum('manual','instant') NOT NULL DEFAULT 'manual',
  `customFields` json DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `coupons` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `discountType` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `usageLimit` int(11) NOT NULL,
  `timesUsed` int(11) NOT NULL DEFAULT 0,
  `firstPurchaseOnly` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_UNIQUE` (`code`)
);

CREATE TABLE `orders` (
  `id` varchar(255) NOT NULL,
  `customerId` varchar(255) NOT NULL,
  `items` json NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentMethod` json NOT NULL,
  `paymentProofImage` text DEFAULT NULL,
  `status` enum('pending','completed','refunded') NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deliveredItems` json DEFAULT NULL,
  `refundReason` text DEFAULT NULL,
  `refundedAt` datetime DEFAULT NULL,
  `appliedCouponCode` varchar(255) DEFAULT NULL,
  `discountAmount` decimal(10,2) DEFAULT NULL,
  `valhallaCoinsApplied` int(11) DEFAULT NULL,
  `valhallaCoinsValue` decimal(10,2) DEFAULT NULL,
  `reviewPrompted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
);

CREATE TABLE `payment_methods` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `instructions` text NOT NULL,
  `requiresProof` tinyint(1) NOT NULL DEFAULT 0,
  `taxRate` decimal(5,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
);

CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `variants` json NOT NULL,
  `image` varchar(1024) NOT NULL,
  `category` varchar(255) NOT NULL,
  `aiHint` varchar(255) DEFAULT NULL,
  `details` json DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `reviews` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` varchar(1024) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `text` text NOT NULL,
  `product` varchar(255) NOT NULL,
  `proofImage` text DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `stock` (
  `id` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT 0,
  `addedAt` datetime NOT NULL,
  `usedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `avatar` varchar(1024) DEFAULT NULL,
  `walletBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalSpent` decimal(10,2) NOT NULL DEFAULT 0.00,
  `valhallaCoins` int(11) NOT NULL DEFAULT 0,
  `nameStyle` varchar(255) DEFAULT 'default',
  `premium_status` enum('active','cancelled') DEFAULT NULL,
  `premium_subscribed_at` datetime DEFAULT NULL,
  `premium_expires_at` datetime DEFAULT NULL,
  `isBanned` tinyint(1) NOT NULL DEFAULT 0,
  `bannedAt` datetime DEFAULT NULL,
  `banReason` text DEFAULT NULL,
  `warningMessage` text DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
);

-- Note: Firebase is used for Live Chat, so no tables are needed for it here.
