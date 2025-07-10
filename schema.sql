-- Adminer 4.8.1 MySQL 8.0.32 dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` text NOT NULL,
  `backImage` text NOT NULL,
  `description` text NOT NULL,
  `deliveryMethod` enum('manual','instant') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `category_custom_fields`;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `discountType` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `expiresAt` datetime DEFAULT NULL,
  `usageLimit` int NOT NULL,
  `timesUsed` int NOT NULL DEFAULT '0',
  `firstPurchaseOnly` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` varchar(255) NOT NULL,
  `customerId` varchar(255) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `paymentMethodId` varchar(255) NOT NULL,
  `paymentProofImage` text,
  `status` enum('pending','completed','refunded') NOT NULL,
  `createdAt` datetime NOT NULL,
  `refundReason` text,
  `refundedAt` datetime DEFAULT NULL,
  `appliedCouponCode` varchar(255) DEFAULT NULL,
  `discountAmount` decimal(10,2) DEFAULT NULL,
  `valhallaCoinsApplied` int DEFAULT NULL,
  `valhallaCoinsValue` decimal(10,2) DEFAULT NULL,
  `reviewPrompted` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `customerId` (`customerId`),
  KEY `paymentMethodId` (`paymentMethodId`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`paymentMethodId`) REFERENCES `payment_methods` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` varchar(255) NOT NULL,
  `orderId` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `variantId` varchar(255) NOT NULL,
  `quantity` int NOT NULL,
  `pricePerItem` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  KEY `variantId` (`variantId`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variantId`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `order_item_custom_fields`;
CREATE TABLE `order_item_custom_fields` (
  `orderItemId` varchar(255) NOT NULL,
  `fieldName` varchar(255) NOT NULL,
  `fieldValue` text NOT NULL,
  PRIMARY KEY (`orderItemId`,`fieldName`),
  CONSTRAINT `order_item_custom_fields_ibfk_1` FOREIGN KEY (`orderItemId`) REFERENCES `order_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `order_delivered_items`;
CREATE TABLE `order_delivered_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderId` varchar(255) NOT NULL,
  `orderItemId` varchar(255) NOT NULL,
  `stockId` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `orderItemId` (`orderItemId`),
  KEY `stockId` (`stockId`),
  CONSTRAINT `order_delivered_items_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_delivered_items_ibfk_2` FOREIGN KEY (`orderItemId`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_delivered_items_ibfk_3` FOREIGN KEY (`stockId`) REFERENCES `stock` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


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


DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` text NOT NULL,
  `categoryId` varchar(255) NOT NULL,
  `aiHint` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `product_details`;
CREATE TABLE `product_details` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `product_details_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` text NOT NULL,
  `rating` int NOT NULL,
  `text` text NOT NULL,
  `product` varchar(255) NOT NULL,
  `proofImage` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `stock`;
CREATE TABLE `stock` (
  `id` varchar(255) NOT NULL,
  `productId` varchar(255) NOT NULL,
  `data` text NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT '0',
  `addedAt` datetime NOT NULL,
  `usedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  CONSTRAINT `stock_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `isAdmin` tinyint(1) DEFAULT '0',
  `avatar` text,
  `walletBalance` decimal(10,2) DEFAULT '0.00',
  `totalSpent` decimal(10,2) DEFAULT '0.00',
  `valhallaCoins` int DEFAULT '0',
  `nameStyle` varchar(50) DEFAULT 'default',
  `premiumStatus` enum('active','cancelled') DEFAULT NULL,
  `premiumSubscribedAt` datetime DEFAULT NULL,
  `premiumExpiresAt` datetime DEFAULT NULL,
  `isBanned` tinyint(1) DEFAULT '0',
  `bannedAt` datetime DEFAULT NULL,
  `banReason` text,
  `warningMessage` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `admin_permissions`;
CREATE TABLE `admin_permissions` (
  `userId` varchar(255) NOT NULL,
  `canManageProducts` tinyint(1) DEFAULT '0',
  `canManageCategories` tinyint(1) DEFAULT '0',
  `canManageOrders` tinyint(1) DEFAULT '0',
  `canManageUsers` tinyint(1) DEFAULT '0',
  `canManageCoupons` tinyint(1) DEFAULT '0',
  `canManageAppearance` tinyint(1) DEFAULT '0',
  `canManageAdmins` tinyint(1) DEFAULT '0',
  `canManageLiveChat` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`userId`),
  CONSTRAINT `admin_permissions_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- 2024-05-24 10:00:00
