-- This is a sample schema for a MySQL database.
-- You can use this file to set up your database structure on Hostinger using phpMyAdmin's "Import" feature.

SET NAMES utf8mb4;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

--
-- Table structure for table `categories`
--
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` text NOT NULL,
  `backImage` text NOT NULL,
  `description` text NOT NULL,
  `deliveryMethod` enum('manual','instant') NOT NULL,
  `customFields` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `coupons`
--
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `discountType` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `usageLimit` int NOT NULL,
  `timesUsed` int NOT NULL DEFAULT '0',
  `firstPurchaseOnly` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `orders`
--
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` varchar(255) NOT NULL,
  `customerId` varchar(255) NOT NULL,
  `items` json NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentMethod` json NOT NULL,
  `paymentProofImage` text,
  `status` enum('pending','completed','refunded') NOT NULL,
  `createdAt` datetime NOT NULL,
  `deliveredItems` json DEFAULT NULL,
  `refundReason` text,
  `refundedAt` datetime DEFAULT NULL,
  `appliedCouponCode` varchar(255) DEFAULT NULL,
  `discountAmount` decimal(10,2) DEFAULT NULL,
  `valhallaCoinsApplied` int DEFAULT NULL,
  `valhallaCoinsValue` decimal(10,2) DEFAULT NULL,
  `reviewPrompted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `payment_methods`
--
DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `icon` varchar(255) NOT NULL,
  `instructions` text NOT NULL,
  `requiresProof` tinyint(1) NOT NULL,
  `taxRate` decimal(5,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `products`
--
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `variants` json NOT NULL,
  `image` text NOT NULL,
  `category` varchar(255) NOT NULL,
  `aiHint` varchar(255) DEFAULT NULL,
  `details` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `reviews`
--
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` text,
  `rating` int NOT NULL,
  `text` text NOT NULL,
  `product` varchar(255) NOT NULL,
  `proofImage` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `stock`
--
DROP TABLE IF EXISTS `stock`;
CREATE TABLE `stock` (
  `id` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `data` text NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT '0',
  `addedAt` datetime NOT NULL,
  `usedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `users`
--
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `avatar` text,
  `walletBalance` decimal(10,2) NOT NULL DEFAULT '0.00',
  `totalSpent` decimal(10,2) NOT NULL DEFAULT '0.00',
  `valhallaCoins` int NOT NULL DEFAULT '0',
  `nameStyle` varchar(255) DEFAULT 'default',
  `premium` json DEFAULT NULL,
  `isBanned` tinyint(1) DEFAULT '0',
  `bannedAt` datetime DEFAULT NULL,
  `banReason` text,
  `warningMessage` text,
  `permissions` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Note on Firebase:
-- The live chat data (sessions and messages) is stored in Firebase Firestore,
-- not in this MySQL database. The schema for that is handled automatically
-- by the application code when it interacts with Firestore.
