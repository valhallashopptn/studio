
-- SQL Schema for TopUp Hub
-- This script creates the tables needed for the application to run in a production environment.

-- Use the correct database name provided by your hosting service.
-- For example: USE u123456789_mydb;

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

--
-- Table structure for `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `avatar` text DEFAULT NULL,
  `walletBalance` decimal(10,2) NOT NULL DEFAULT 0.00,
  `totalSpent` decimal(10,2) NOT NULL DEFAULT 0.00,
  `valhallaCoins` int(11) NOT NULL DEFAULT 0,
  `nameStyle` varchar(50) DEFAULT 'default',
  `premium` json DEFAULT NULL,
  `isBanned` tinyint(1) NOT NULL DEFAULT 0,
  `bannedAt` datetime DEFAULT NULL,
  `banReason` text DEFAULT NULL,
  `warningMessage` text DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `categories`
--
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` text NOT NULL,
  `backImage` text NOT NULL,
  `description` text NOT NULL,
  `deliveryMethod` enum('manual','instant') NOT NULL DEFAULT 'manual',
  `customFields` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `products`
--
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `variants` json NOT NULL,
  `image` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `aiHint` varchar(255) NOT NULL,
  `details` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `orders`
--
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` varchar(255) NOT NULL,
  `customerId` varchar(255) NOT NULL,
  `items` json NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentMethod` json NOT NULL,
  `paymentProofImage` text DEFAULT NULL,
  `status` enum('pending','completed','refunded') NOT NULL DEFAULT 'pending',
  `createdAt` datetime NOT NULL,
  `deliveredItems` json DEFAULT NULL,
  `refundReason` text DEFAULT NULL,
  `refundedAt` datetime DEFAULT NULL,
  `appliedCouponCode` varchar(255) DEFAULT NULL,
  `discountAmount` decimal(10,2) DEFAULT 0.00,
  `valhallaCoinsApplied` int(11) DEFAULT 0,
  `valhallaCoinsValue` decimal(10,2) DEFAULT 0.00,
  `reviewPrompted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `stock`
--
DROP TABLE IF EXISTS `stock`;
CREATE TABLE `stock` (
  `id` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `code` text NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT 0,
  `addedAt` datetime NOT NULL,
  `usedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


--
-- Table structure for `reviews`
--
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` text DEFAULT NULL,
  `rating` int(1) NOT NULL,
  `text` text NOT NULL,
  `product` varchar(255) NOT NULL,
  `proofImage` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for `coupons`
--
DROP TABLE IF EXISTS `coupons`;
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
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Chat sessions are handled by Firebase Firestore and do not need a SQL table.

--
-- You would also need to insert your initial data (from lib/data.ts)
-- into these tables using INSERT statements if you want to start with
-- the same products, users, and categories.
--

